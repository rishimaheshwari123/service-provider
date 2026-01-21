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

const purchaseCategoryCtrl = async (req, res) => {
  try {
    const { vendorId, categoryId, transactionId, paymentMode = "prepaid", paymentMethod, assignedByAdmin } = req.body;
    // Support both paymentMode (old) and paymentMethod (new from admin assign)
    const finalPaymentMode = paymentMethod || paymentMode;
    
    if (!vendorId || !categoryId) {
      return res.status(400).json({ success: false, message: "vendorId and categoryId are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category || category.active === false) {
      return res.status(404).json({ success: false, message: "Category not found or inactive" });
    }

    // Check existing purchase
    let purchase = await VendorCategoryPurchase.findOne({ vendor: vendorId, category: categoryId });
    if (purchase) {
      // Already exists
      if (purchase.status === "purchased") {
        return res.status(200).json({ success: true, message: "Already purchased", purchase });
      }
      
      // If assigned by admin, directly approve regardless of payment method
      if (assignedByAdmin) {
        purchase.status = "purchased";
        purchase.transactionId = transactionId || purchase.transactionId;
        purchase.paymentMode = finalPaymentMode;
        purchase.assignedByAdmin = true;
        await purchase.save();
        purchase = await purchase.populate("category");
        return res.status(200).json({ success: true, message: "Category assigned and approved", purchase });
      }
      
      if (finalPaymentMode === "prepaid" || finalPaymentMode === "qr") {
        // convert pending/rejected to purchased for prepaid or QR
        purchase.status = "purchased";
        purchase.transactionId = transactionId || purchase.transactionId;
        purchase.paymentMode = finalPaymentMode;
        await purchase.save();
      } else {
        // cash flow should be pending regardless of previous status
        purchase.status = "pending";
        purchase.paymentMode = "cash";
        await purchase.save();
      }
      purchase = await purchase.populate("category");
      const msg = finalPaymentMode === "cash" ? "Purchase requested (cash) and pending approval" : "Category purchased";
      return res.status(200).json({ success: true, message: msg, purchase });
    } else {
      // Create new purchase
      // If assigned by admin, directly set status as purchased
      const status = assignedByAdmin ? "purchased" : (finalPaymentMode === "cash" ? "pending" : "purchased");
      purchase = await VendorCategoryPurchase.create({ 
        vendor: vendorId, 
        category: categoryId, 
        status, 
        transactionId, 
        paymentMode: finalPaymentMode,
        assignedByAdmin: assignedByAdmin || false
      });
      purchase = await purchase.populate("category");
      const msg = assignedByAdmin ? "Category assigned and approved" : (finalPaymentMode === "cash" ? "Purchase requested (cash) and pending approval" : "Category purchased");
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

module.exports = {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  purchaseCategoryCtrl,
  getPurchasedCategoriesCtrl,
  updateCategoryCtrl,
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
    const pending = await VendorCategoryPurchase.find({ status: "pending", paymentMode: "cash" })
      .populate({ path: "vendor", select: "name email company status" })
      .populate({ path: "category", select: "name price" })
      .sort({ createdAt: -1 });
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