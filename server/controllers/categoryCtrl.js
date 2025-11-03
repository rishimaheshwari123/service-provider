const Category = require("../models/categoryModel");
const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");

const createCategoryCtrl = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Name and price are required" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name, price });
    return res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCategoriesCtrl = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const purchaseCategoryCtrl = async (req, res) => {
  try {
    const { vendorId, categoryId, transactionId, paymentMode = "prepaid" } = req.body;
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
      if (paymentMode === "prepaid") {
        // convert pending/rejected to purchased
        purchase.status = "purchased";
        purchase.transactionId = transactionId || purchase.transactionId;
        purchase.paymentMode = "prepaid";
        await purchase.save();
      } else {
        // cash flow should be pending regardless of previous status
        purchase.status = "pending";
        purchase.paymentMode = "cash";
        await purchase.save();
      }
      purchase = await purchase.populate("category");
      const msg = paymentMode === "cash" ? "Purchase requested (cash) and pending approval" : "Category purchased";
      return res.status(200).json({ success: true, message: msg, purchase });
    } else {
      // Create new purchase
      const status = paymentMode === "cash" ? "pending" : "purchased";
      purchase = await VendorCategoryPurchase.create({ vendor: vendorId, category: categoryId, status, transactionId, paymentMode });
      purchase = await purchase.populate("category");
      const msg = paymentMode === "cash" ? "Purchase requested (cash) and pending approval" : "Category purchased";
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
    const { name, price, active } = req.body;
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

    await category.save();
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
      return res.status(400).json({ success: false, message: "categoryId is required" });
    }

    const purchases = await VendorCategoryPurchase.find({ category: categoryId, status: "purchased" })
      .populate({ path: "vendor", select: "name email phone status" })
      .populate({ path: "category", select: "name price" });

    const purchasers = purchases.map((p) => ({ vendor: p.vendor, purchasedAt: p.createdAt }));
    return res.status(200).json({ success: true, purchasers });
  } catch (error) {
    console.error("Error fetching category purchasers:", error);
    return res.status(500).json({ success: false, message: "Server error" });
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
    const purchase = await VendorCategoryPurchase.findById(purchaseId);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });
    purchase.status = "rejected";
    await purchase.save();
    const populated = await purchase.populate([{ path: "vendor", select: "name email" }, { path: "category", select: "name price" }]);
    return res.status(200).json({ success: true, message: "Purchase rejected", purchase: populated });
  } catch (error) {
    console.error("Error rejecting purchase:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getPendingPurchasesCtrl = getPendingPurchasesCtrl;
module.exports.getVendorPendingPurchasesCtrl = getVendorPendingPurchasesCtrl;
module.exports.approvePurchaseCtrl = approvePurchaseCtrl;
module.exports.rejectPurchaseCtrl = rejectPurchaseCtrl;