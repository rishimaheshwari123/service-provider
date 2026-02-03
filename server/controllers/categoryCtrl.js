const Category = require("../models/categoryModel");
const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");
const { uploadImageToCloudinary } = require("../config/imageUploader");

const createCategoryCtrl = async (req, res) => {
  try {
    const { name, price, autoFilled } = req.body;
    
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
      console.log("Uploading image to cloudinary...");
      const result = await uploadImageToCloudinary(req.files.image, "categories", 400, 80);
      console.log("Cloudinary result:", result);
      imageUrl = result.secure_url;
    } else {
      console.log("No image file received");
    }

    const category = await Category.create({ name, price, autoFilled: autoFilled || "", image: imageUrl });
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
    return res.status(200).json({ success: true, categories });
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
      category: category.name 
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
      category: category.name, // Category name
      description: vendor.description || category.autoFilled || `${category.name} service provided by ${vendor.name}`, // Vendor description or category auto-filled
      images: category.image ? [{ url: category.image }] : [], // Category image
      vendor: vendorId, // Vendor ID
      status: "active"
    };

    const newProperty = await Property.create(propertyData);
    console.log("Property created automatically:", newProperty._id);
    return newProperty;
  } catch (error) {
    console.error("Error creating property automatically:", error);
    return null;
  }
};

const purchaseCategoryCtrl = async (req, res) => {
  try {
    const { vendorId, categoryId, transactionId, paymentMode = "prepaid", paymentMethod, assignedByAdmin, status, isAdmin } = req.body;
    // Support both paymentMode (old) and paymentMethod (new from admin assign)
    const finalPaymentMode = paymentMethod || paymentMode;
    
    console.log("Purchase request received:", { vendorId, categoryId, finalPaymentMode, assignedByAdmin, status, isAdmin });
    
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
        await purchase.save();
        purchase = await purchase.populate("category");
        shouldCreateProperty = true; // Create property when admin assigns/approves
      }
      
      // For online payments (prepaid/razorpay), create service immediately
      else if (finalPaymentMode === "prepaid" || finalPaymentMode === "razorpay") {
        purchase.status = "purchased";
        purchase.transactionId = transactionId || purchase.transactionId;
        purchase.paymentMode = finalPaymentMode;
        await purchase.save();
        shouldCreateProperty = true; // Create property for online payments
      } 
      // For cash/QR payments, don't create service - wait for admin approval
      else if (finalPaymentMode === "cash" || finalPaymentMode === "qr") {
        purchase.status = isAdmin ? "purchased" : "pending";
        purchase.paymentMode = finalPaymentMode;
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
        assignedByAdmin: assignedByAdmin || isAdmin || false
      });
      purchase = await purchase.populate("category");
      
      // Create property automatically if conditions are met
      if (shouldCreateProperty) {
        await createPropertyForCategory(vendorId, categoryId);
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
    const categories = purchases.map((p) => p.category).filter(Boolean);

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching purchased categories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateCategoryCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, active, autoFilled } = req.body;
    
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

    if (name !== undefined) category.name = name;
    if (price !== undefined) category.price = price;
    if (active !== undefined) category.active = active;
    if (autoFilled !== undefined) category.autoFilled = autoFilled;

    // Handle image upload
    if (req.files && req.files.image) {
      console.log("Uploading image to cloudinary...");
      const result = await uploadImageToCloudinary(req.files.image, "categories", 400, 80);
      console.log("Cloudinary result:", result);
      category.image = result.secure_url;
    } else {
      console.log("No image file received in update");
    }

    await category.save();
    console.log("Category updated:", category);
    return res.status(200).json({ success: true, message: "Category updated", category });
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
    const purchases = await VendorCategoryPurchase.find({ category: id });
    if (purchases.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete category. It has existing purchases. Please contact vendors to remove their purchases first." 
      });
    }

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

    // Fetch purchased entries and populate vendor & category
    const purchases = await VendorCategoryPurchase.find({
      category: categoryId,
      status: "purchased",
    })
      .populate({ path: "vendor", select: "name email phone status" })
      .populate({ path: "category", select: "name price" });

    // Map required fields including paymentMode and transactionId
    const purchasers = purchases.map((p) => ({
      vendor: p.vendor,
      purchasedAt: p.createdAt,
      paymentMode: p.paymentMode,
      transactionId: p.transactionId,
      category: p.category, // optional, in case you want category name & price on frontend
    }));

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