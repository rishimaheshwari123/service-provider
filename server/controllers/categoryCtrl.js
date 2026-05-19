const Category = require("../models/categoryModel");
const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");
const { uploadImageToCloudinary } = require("../config/s3Uploader");
const { sendWelcomeSMS1, sendWelcomeSMS2, sendWhatsAppWelcome, sendApprovalSMS, sendApprovalWhatsApp } = require("../utils/otpService");

const createCategoryCtrl = async (req, res) => {
  try {
    const { name, price, premiumPrice, premiumPlusPrice, autoFilled } = req.body;
    
    // Debug logs
    console.log("=== CREATE CATEGORY DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Name and price are required" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    let imageUrl = "";
    if (req.files && req.files.image) {
      console.log("Uploading image to S3...");
      const result = await uploadImageToCloudinary(req.files.image, "categories", 400, 80);
      console.log("S3 upload result:", result);
      imageUrl = result.secure_url;
    } else {
      console.log("No image file received");
    }

    const category = await Category.create({ 
      name, 
      price, 
      premiumPrice: premiumPrice || 0,
      premiumPlusPrice: premiumPlusPrice || 0,
      autoFilled: autoFilled || "", 
      image: imageUrl 
    });
    console.log("Category created:", category);
    return res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCategoriesCtrl = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    
    // Helper function to normalize autoFilled values - sab kuch lowercase mein convert karo
    const normalizeAutoFilled = (autoFilled) => {
      if (!autoFilled || autoFilled.trim() === '') return null;
      
      // Sab kuch lowercase mein convert karo, trim karo, aur extra spaces remove karo
      let normalized = autoFilled.toLowerCase().trim().replace(/\s+/g, ' ');
      
      // Common variations ko handle karo - sab lowercase mein
      const normalizations = {
        // Home Service variations
        'home service': 'home services',
        'home services': 'home services',
        'homeservice': 'home services',
        'homeservices': 'home services',
        'home service': 'home services',
        
        // Repairing variations
        'repairing': 'repairing',
        'repair': 'repairing',
        'repairs': 'repairing',
        
        // Transport variations
        'transport': 'transport',
        'transportation': 'transport',
        'tranport': 'transport', // typo fix
        
        // Event Management variations
        'event management': 'event management',
        'event managment': 'event management',
        'event': 'event management',
        
        // Construction variations
        'construction': 'construction',
        
        // Shop variations
        'shop': 'shop',
        'shops': 'shop',
        
        // Food variations
        'food': 'food',
        'foods': 'food',
        
        // Education variations
        'education': 'education',
        'educational': 'education',
        
        // Health Care variations
        'health care': 'health care',
        'healthcare': 'health care',
        'health': 'health care',
        'medical': 'health care',
        
        // Legal variations
        'legal': 'legal',
        
        // Astro variations
        'astro': 'astro',
        'astrology': 'astro',
        
        // Sports variations
        'sports': 'sports',
        'sport': 'sports',
        
        // Office/School Work variations
        'office/ school work': 'office work',
        'office/school work': 'office work',
        'office work': 'office work',
        'school work': 'office work',
        'office/ school work': 'office work',
        'office/school work': 'office work',
        
        // Car/Bike variations
        'car/bike': 'car bike',
        'car/ bike': 'car bike',
        'car bike': 'car bike',
        
        // Decoration variations
        'decoration': 'decoration',
        
        // Beauty & Spa variations
        'beauty': 'beauty spa',
        'beauty & spa': 'beauty spa',
        'spa': 'beauty spa',
        
        // Wedding variations
        'wedding': 'wedding services',
        'wedding services': 'wedding services',
        'wedding planning': 'wedding services',
        
        // Fitness variations
        'fitness': 'fitness gym',
        'gym': 'fitness gym',
        'fitness & gym': 'fitness gym',
        
        // Hotels variations
        'hotel': 'hotels accommodation',
        'hotels': 'hotels accommodation',
        'accommodation': 'hotels accommodation',
        'hotels & accommodation': 'hotels accommodation'
      };
      
      // Agar normalization mein hai to use karo, nahi to original lowercase return karo
      return normalizations[normalized] || normalized;
    };
    
    // Helper function to convert to display format (Title Case)
    const toDisplayFormat = (text) => {
      return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    // Group categories by normalized autoFilled value
    const groupedCategories = {};
    const ungroupedCategories = [];
    
    categories.forEach(category => {
      const normalizedAutoFilled = normalizeAutoFilled(category.autoFilled);
      
      if (normalizedAutoFilled) {
        // Group by normalized autoFilled value (lowercase)
        if (!groupedCategories[normalizedAutoFilled]) {
          groupedCategories[normalizedAutoFilled] = [];
        }
        groupedCategories[normalizedAutoFilled].push(category);
      } else {
        // Categories without autoFilled value
        ungroupedCategories.push(category);
      }
    });
    
    // Convert grouped object to array format and sort by title
    const autoFilledGroups = Object.keys(groupedCategories)
      .sort() // Sort group titles alphabetically
      .map(normalizedKey => ({
        title: toDisplayFormat(normalizedKey), // Display mein Title Case
        categories: groupedCategories[normalizedKey].sort((a, b) => a.name.localeCompare(b.name)) // Sort categories within group
      }));
    
    autoFilledGroups.forEach(group => {
      // Show first few category names for debugging
      const categoryNames = group.categories.slice(0, 3).map(cat => cat.name).join(', ');
    });
    
    return res.status(200).json({ 
      success: true, 
      categories, // Original flat array for backward compatibility
      groupedData: {
        autoFilledGroups,
        ungroupedCategories: ungroupedCategories.sort((a, b) => a.name.localeCompare(b.name)) // Sort ungrouped categories
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to create property/service automatically
const createPropertyForCategory = async (vendorId, categoryId) => {
  try {
    const Property = require("../models/propertyModel");
    const Vendor = require("../models/vendorModel");
    
    // Get vendor and category details
    const vendor = await Vendor.findById(vendorId);
    const category = await Category.findById(categoryId);
    
    if (!vendor || !category) {
      console.log("Vendor or category not found for property creation");
      return null;
    }

    // Check if property already exists for this vendor-category combination
    const existingProperty = await Property.findOne({ 
      vendor: vendorId, 
      category: categoryId // Now using ObjectId
    });
    
    if (existingProperty) {
      console.log("Property already exists for this vendor-category combination");
      return existingProperty;
    }

    // Create property with vendor and category information
    const propertyData = {
      title: category.name, // Category name as title
      price: category.price.toString(), // Category price
      location: vendor.address || vendor.serviceLocation || "Location not specified", // Vendor location
      type: "service", // Default type
      category: categoryId, // Category ObjectId
      description: vendor.description || category.autoFilled || `${category.name} service provided by ${vendor.name}`, // Vendor description or category auto-filled
      images: vendor.portfolioImages && vendor.portfolioImages.length > 0 
        ? vendor.portfolioImages // Use vendor's portfolio images if available
        : category.image ? [{ url: category.image }] : [], // Fallback to category image
      vendor: vendorId, // Vendor ID
      status: "active"
    };

    const newProperty = await Property.create(propertyData);
    console.log("Property created automatically:", newProperty._id);
    console.log("Images used:", vendor.portfolioImages && vendor.portfolioImages.length > 0 
      ? `Vendor portfolio images (${vendor.portfolioImages.length} images)` 
      : "Category image (fallback)");
    return newProperty;
  } catch (error) {
    console.error("Error creating property automatically:", error);
    return null;
  }
};

// Helper function to send welcome messages to vendor on first purchase
const sendVendorWelcomeMessages = async (vendor) => {
  try {
    console.log('🎉 Sending welcome messages to vendor on first purchase:', vendor.name);
    
    const phoneNumber = vendor.phone;
    const vendorName = vendor.name;
    const vendorId = vendor._id;
    const supportContact = '+91 78798 84363';
    
    // Send first welcome SMS (registration confirmation)
    const welcomeSMS1Result = await sendWelcomeSMS1(phoneNumber, vendorName, vendorId);
    if (welcomeSMS1Result.success) {
      console.log('✅ Welcome SMS 1 sent successfully');
    } else {
      console.error('❌ Welcome SMS 1 failed:', welcomeSMS1Result.message);
    }
    
    // Send second welcome SMS (account registered)
    const welcomeSMS2Result = await sendWelcomeSMS2(phoneNumber, vendorName, supportContact, vendorId);
    if (welcomeSMS2Result.success) {
      console.log('✅ Welcome SMS 2 sent successfully');
    } else {
      console.error('❌ Welcome SMS 2 failed:', welcomeSMS2Result.message);
    }
    
    // Send WhatsApp welcome message if user has WhatsApp verified
    if (vendor.whatsappNumber && vendor.isWhatsappVerified) {
      console.log('📱 Sending WhatsApp welcome message...');
      const whatsappWelcomeResult = await sendWhatsAppWelcome(vendor.whatsappNumber, vendorName, supportContact, vendorId);
      if (whatsappWelcomeResult.success) {
        console.log('✅ WhatsApp welcome message sent successfully');
      } else {
        console.error('❌ WhatsApp welcome message failed:', whatsappWelcomeResult.message);
      }
    }
    
  } catch (welcomeError) {
    console.error('❌ Error sending welcome messages:', welcomeError);
    // Don't fail the purchase if welcome messages fail
  }
};

const purchaseCategoryCtrl = async (req, res) => {
  try {
    const { 
      vendorId, 
      categoryId, 
      transactionId, 
      paymentMode = "prepaid", 
      paymentMethod, 
      assignedByAdmin, 
      status, 
      isAdmin,
      priceTier = "basic",
      selectedPrice,
      finalPrice,
      // Coupon information
      couponCode,
      couponId,
      discountAmount = 0
    } = req.body;
    
    // Support both paymentMode (old) and paymentMethod (new from admin assign)
    const finalPaymentMode = paymentMethod || paymentMode;
    
    console.log("Purchase request received:", { 
      vendorId, 
      categoryId, 
      finalPaymentMode, 
      assignedByAdmin, 
      status, 
      isAdmin,
      priceTier,
      selectedPrice,
      finalPrice,
      couponCode,
      discountAmount
    });
    
    if (!vendorId || !categoryId) {
      return res.status(400).json({ success: false, message: "vendorId and categoryId are required" });
    }

    // Check if vendor exists
    const Vendor = require("../models/vendorModel");
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.log("Vendor not found:", vendorId);
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    console.log("Vendor found:", { id: vendor._id, name: vendor.name, email: vendor.email });

    const category = await Category.findById(categoryId);
    if (!category || category.active === false) {
      return res.status(404).json({ success: false, message: "Category not found or inactive" });
    }

    // Calculate price based on tier if not provided
    let calculatedPrice = selectedPrice || finalPrice;
    if (!calculatedPrice) {
      switch (priceTier) {
        case "premium":
          calculatedPrice = category.premiumPrice || category.price;
          break;
        case "premiumPlus":
          calculatedPrice = category.premiumPlusPrice || category.price;
          break;
        default:
          calculatedPrice = category.price;
      }
    }

    // Check existing purchase
    let purchase = await VendorCategoryPurchase.findOne({ vendor: vendorId, category: categoryId });
    let shouldCreateProperty = false;
    
    if (purchase) {
      // Already exists
      if (purchase.status === "purchased") {
        return res.status(200).json({ success: true, message: "Already purchased", purchase });
      }
      
      // If assigned by admin or isAdmin flag is true, directly approve with "purchased" status
      if (assignedByAdmin || isAdmin) {
        purchase.status = status || "purchased"; // Use provided status or default to "purchased"
        purchase.transactionId = transactionId || purchase.transactionId;
        purchase.paymentMode = finalPaymentMode;
        purchase.assignedByAdmin = assignedByAdmin || isAdmin;
        purchase.priceTier = priceTier;
        purchase.selectedPrice = calculatedPrice;
        purchase.finalPrice = finalPrice || calculatedPrice;
        purchase.couponCode = couponCode;
        purchase.couponId = couponId;
        purchase.discountAmount = discountAmount;
        await purchase.save();
        purchase = await purchase.populate("category");
        shouldCreateProperty = true; // Create property when admin assigns/approves
      }
      
      // For online payments (prepaid/razorpay), create service immediately
      else if (finalPaymentMode === "prepaid" || finalPaymentMode === "razorpay") {
        purchase.status = "purchased";
        purchase.transactionId = transactionId || purchase.transactionId;
        purchase.paymentMode = finalPaymentMode;
        purchase.priceTier = priceTier;
        purchase.selectedPrice = selectedPrice;
        purchase.finalPrice = finalPrice || calculatedPrice;
        purchase.couponCode = couponCode;
        purchase.couponId = couponId;
        purchase.discountAmount = discountAmount;
        await purchase.save();
        shouldCreateProperty = true; // Create property for online payments
      } 
      // For cash/QR payments, don't create service - wait for admin approval
      else if (finalPaymentMode === "cash" || finalPaymentMode === "qr") {
        purchase.status = isAdmin ? "purchased" : "pending";
        purchase.paymentMode = finalPaymentMode;
        purchase.priceTier = priceTier;
        purchase.selectedPrice = selectedPrice;
        purchase.finalPrice = finalPrice || calculatedPrice;
        purchase.couponCode = couponCode;
        purchase.couponId = couponId;
        purchase.discountAmount = discountAmount;
        await purchase.save();
        if (isAdmin) {
          shouldCreateProperty = true; // Create property if admin approves cash/QR payment
        }
        // Don't create property for regular users with cash/QR - wait for approval
      }
      
      purchase = await purchase.populate("category");
      
      // Create property automatically if conditions are met
      if (shouldCreateProperty) {
        await createPropertyForCategory(vendorId, categoryId);
      }
      
      // Send welcome messages on ANY purchase (pending or purchased) - not just approved ones
      // Check if this is the vendor's first purchase attempt (any status)
      const previousPurchases = await VendorCategoryPurchase.countDocuments({ 
        vendor: vendorId,
        _id: { $ne: purchase._id } // Exclude current purchase
      });
      
      if (previousPurchases === 0) {
        console.log('🎊 This is vendor\'s first purchase! Sending welcome messages...');
        await sendVendorWelcomeMessages(vendor);
      }
      
      const msg = ((finalPaymentMode === "cash" || finalPaymentMode === "qr") && !isAdmin) ? 
        "Purchase requested and pending approval" : "Category purchased";
      return res.status(200).json({ success: true, message: msg, purchase });
    } else {
      // Create new purchase
      let finalStatus;
      
      if (assignedByAdmin || isAdmin) {
        // Admin assigns or vendor self-registers
        finalStatus = status || "purchased";
        shouldCreateProperty = true;
      } else {
        // Regular vendor purchase
        if (finalPaymentMode === "prepaid" || finalPaymentMode === "razorpay") {
          // Online payments - approve immediately and create service
          finalStatus = "purchased";
          shouldCreateProperty = true;
        } else {
          // Cash/QR payments - pending approval, no service creation
          finalStatus = "pending";
          shouldCreateProperty = false;
        }
      }
      
      purchase = await VendorCategoryPurchase.create({ 
        vendor: vendorId, 
        category: categoryId, 
        status: finalStatus, 
        transactionId, 
        paymentMode: finalPaymentMode,
        assignedByAdmin: assignedByAdmin || isAdmin || false,
        priceTier: priceTier,
        selectedPrice: selectedPrice,
        finalPrice: finalPrice || calculatedPrice,
        couponCode: couponCode,
        couponId: couponId,
        discountAmount: discountAmount
      });
      purchase = await purchase.populate("category");
      
      // Create property automatically if conditions are met
      if (shouldCreateProperty) {
        await createPropertyForCategory(vendorId, categoryId);
      }
      
      // Send welcome messages on ANY first purchase (pending or purchased)
      // Check if this is the vendor's first purchase attempt (any status)
      const previousPurchases = await VendorCategoryPurchase.countDocuments({ 
        vendor: vendorId,
        _id: { $ne: purchase._id } // Exclude current purchase
      });
      
      if (previousPurchases === 0) {
        console.log('🎊 This is vendor\'s first purchase! Sending welcome messages...');
        await sendVendorWelcomeMessages(vendor);
      }
      
      let msg;
      if (assignedByAdmin || isAdmin) {
        msg = "Category assigned and approved";
      } else if (finalPaymentMode === "prepaid" || finalPaymentMode === "razorpay") {
        msg = "Category purchased successfully";
      } else {
        msg = "Purchase requested and pending approval";
      }
      
      return res.status(200).json({ success: true, message: msg, purchase });
    }
  } catch (error) {
    console.error("Error purchasing category:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPurchasedCategoriesCtrl = async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!vendorId) {
      return res.status(400).json({ success: false, message: "vendorId is required" });
    }

    const purchases = await VendorCategoryPurchase.find({ vendor: vendorId, status: "purchased" })
      .populate("category");
    
    // Return full purchase information including price tier
    const purchaseData = purchases.map((purchase) => ({
      _id: purchase._id,
      category: purchase.category,
      priceTier: purchase.priceTier || "basic",
      selectedPrice: purchase.selectedPrice,
      paymentMode: purchase.paymentMode,
      status: purchase.status,
      createdAt: purchase.createdAt,
      transactionId: purchase.transactionId
    }));

    return res.status(200).json({ 
      success: true, 
      categories: purchaseData // Keep the same response structure for backward compatibility
    });
  } catch (error) {
    console.error("Error fetching purchased categories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateCategoryCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, premiumPrice, premiumPlusPrice, active, autoFilled } = req.body;
    
    // Debug logs
    console.log("=== UPDATE CATEGORY DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Category id is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Store old name for updating related services
    const oldName = category.name;
    let updatedPropertiesCount = 0;

    // Update category fields
    if (name !== undefined && name !== oldName) {
      // Update category name
      category.name = name;
      
      // Update all properties that use this category (by ObjectId, not name)
      const Property = require("../models/propertyModel");
      
      // Update properties where category ObjectId matches this category
      // We only need to update the title if it matches the old category name
      const titleUpdateResult = await Property.updateMany(
        { 
          category: id, // Match by category ObjectId
          title: oldName // Only update if title matches old category name
        },
        { 
          $set: { title: name }
        }
      );
      
      updatedPropertiesCount = titleUpdateResult.modifiedCount;
      
      console.log(`Updated ${updatedPropertiesCount} properties with new category name: ${oldName} -> ${name}`);
    }
    
    if (price !== undefined) category.price = price;
    if (premiumPrice !== undefined) category.premiumPrice = premiumPrice;
    if (premiumPlusPrice !== undefined) category.premiumPlusPrice = premiumPlusPrice;
    if (active !== undefined) category.active = active;
    if (autoFilled !== undefined) category.autoFilled = autoFilled;

    // Handle image upload
    if (req.files && req.files.image) {
      console.log("Uploading image to S3...");
      const result = await uploadImageToCloudinary(req.files.image, "categories", 400, 80);
      console.log("S3 upload result:", result);
      category.image = result.secure_url;
    } else {
      console.log("No image file received in update");
    }

    await category.save();
    console.log("Category updated:", category);
    
    const responseMessage = updatedPropertiesCount > 0 
      ? `Category updated successfully. ${updatedPropertiesCount} related services also updated.`
      : "Category updated successfully";
    
    return res.status(200).json({ 
      success: true, 
      message: responseMessage, 
      category,
      updatedPropertiesCount 
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteCategoryCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Category id is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Check if category has any purchases
    // const purchases = await VendorCategoryPurchase.find({ category: id });
    // if (purchases.length > 0) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: "Cannot delete category. It has existing purchases. Please contact vendors to remove their purchases first." 
    //   });
    // }

    await Category.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  purchaseCategoryCtrl,
  getPurchasedCategoriesCtrl,
  updateCategoryCtrl,
  deleteCategoryCtrl,
};

// Get purchasers of a specific category (admin)
const getCategoryPurchasersCtrl = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }

    console.log("🔍 Getting purchasers for category:", categoryId);

    // Fetch purchased entries and populate vendor & category
    const purchases = await VendorCategoryPurchase.find({
      category: categoryId,
      status: "purchased",
    })
      .populate({ path: "vendor", select: "name email phone status" })
      .populate({ path: "category", select: "name price" })
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log("📊 Found purchases:", purchases.length);
    console.log("📋 Purchase details:", purchases.map(p => ({
      vendor: p.vendor?.name,
      email: p.vendor?.email,
      paymentMode: p.paymentMode,
      transactionId: p.transactionId,
      status: p.status,
      createdAt: p.createdAt
    })));

    // Map required fields including paymentMode and transactionId
    const purchasers = purchases.map((p) => ({
      vendor: p.vendor,
      purchasedAt: p.createdAt,
      createdAt: p.createdAt, // Add this for frontend compatibility
      paymentMode: p.paymentMode,
      transactionId: p.transactionId,
      status: p.status, // Add status for frontend display
      category: p.category, // optional, in case you want category name & price on frontend
    }));

    console.log("✅ Returning purchasers:", purchasers.length);

    return res.status(200).json({ success: true, purchasers });
  } catch (error) {
    console.error("Error fetching category purchasers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

module.exports.getCategoryPurchasersCtrl = getCategoryPurchasersCtrl;

// List all pending cash purchases (admin overview)
const getPendingPurchasesCtrl = async (req, res) => {
  try {
    // Fetch all pending purchases (cash and QR)
    const pending = await VendorCategoryPurchase.find({ status: "pending" })
      .populate({ path: "vendor", select: "name email company status" })
      .populate({ path: "category", select: "name price" })
      .sort({ createdAt: -1 });
    
    console.log("Pending purchases found:", pending.length);
    pending.forEach((p, index) => {
      console.log(`Purchase ${index + 1}:`, {
        id: p._id,
        vendorId: p.vendor?._id,
        vendorName: p.vendor?.name,
        vendorEmail: p.vendor?.email,
        categoryName: p.category?.name,
        paymentMode: p.paymentMode,
        status: p.status
      });
    });
    
    return res.status(200).json({ success: true, pending });
  } catch (error) {
    console.error("Error fetching pending purchases:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// List vendor's pending purchases
const getVendorPendingPurchasesCtrl = async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!vendorId) return res.status(400).json({ success: false, message: "vendorId is required" });
    const pending = await VendorCategoryPurchase.find({ vendor: vendorId, status: "pending" })
      .populate({ path: "category", select: "name price" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, pending });
  } catch (error) {
    console.error("Error fetching vendor pending purchases:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Approve a pending purchase
const approvePurchaseCtrl = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await VendorCategoryPurchase.findById(purchaseId);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });
    
    purchase.status = "purchased";
    purchase.paymentMode = purchase.paymentMode || "cash";
    await purchase.save();
    
    // Create property automatically when purchase is approved
    await createPropertyForCategory(purchase.vendor, purchase.category);
    
    // Send approval messages when admin approves the purchase
    try {
      const Vendor = require("../models/vendorModel");
      const vendor = await Vendor.findById(purchase.vendor);
      
      if (vendor) {
        console.log('🎉 Category purchase approved by admin! Sending approval messages...');
        
        // Send SMS approval message
        if (vendor.phone) {
          const smsResult = await sendApprovalSMS(vendor.phone, vendor.name, vendor._id);
          if (smsResult.success) {
            console.log('✅ Approval SMS sent successfully');
          } else {
            console.error('❌ Approval SMS failed:', smsResult.message);
          }
        }
        
        // Send WhatsApp approval message if vendor has WhatsApp verified
        if (vendor.whatsappNumber && vendor.isWhatsappVerified) {
          console.log('📱 Sending WhatsApp approval message...');
          const whatsappResult = await sendApprovalWhatsApp(vendor.whatsappNumber, vendor.name, vendor._id);
          if (whatsappResult.success) {
            console.log('✅ WhatsApp approval message sent successfully');
          } else {
            console.error('❌ WhatsApp approval message failed:', whatsappResult.message);
          }
        }
      }
    } catch (approvalError) {
      console.error('❌ Error sending approval messages:', approvalError);
      // Don't fail the approval if messages fail
    }
    
    const populated = await purchase.populate([{ path: "vendor", select: "name email" }, { path: "category", select: "name price" }]);
    return res.status(200).json({ success: true, message: "Purchase approved", purchase: populated });
  } catch (error) {
    console.error("Error approving purchase:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reject a pending purchase
const rejectPurchaseCtrl = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { reason } = req.body;  // ✅ receive reason

    if (!reason || reason.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });
    }

    const purchase = await VendorCategoryPurchase.findById(purchaseId);
    if (!purchase)
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });

    purchase.status = "rejected";
    purchase.reason = reason.trim(); // ✅ save reason
    await purchase.save();

    const populated = await purchase.populate([
      { path: "vendor", select: "name email" },
      { path: "category", select: "name price" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Purchase rejected",
      purchase: populated,
    });
  } catch (error) {
    console.error("Error rejecting purchase:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};


module.exports.getPendingPurchasesCtrl = getPendingPurchasesCtrl;
module.exports.getVendorPendingPurchasesCtrl = getVendorPendingPurchasesCtrl;
module.exports.approvePurchaseCtrl = approvePurchaseCtrl;
module.exports.rejectPurchaseCtrl = rejectPurchaseCtrl;