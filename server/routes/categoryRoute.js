const express = require("express");
const {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  purchaseCategoryCtrl,
  getPurchasedCategoriesCtrl,
  updateCategoryCtrl,
  getCategoryPurchasersCtrl,
  getPendingPurchasesCtrl,
  getVendorPendingPurchasesCtrl,
  approvePurchaseCtrl,
  rejectPurchaseCtrl,
} = require("../controllers/categoryCtrl");

const router = express.Router();

// Admin: create category
router.post("/create", createCategoryCtrl);

// Admin: update category
router.put("/update/:id", updateCategoryCtrl);

// Public: list categories
router.get("/getAll", getAllCategoriesCtrl);

// Vendor: purchase a category
router.post("/purchase", purchaseCategoryCtrl);

// Vendor: list purchased categories
router.get("/purchased/:vendorId", getPurchasedCategoriesCtrl);

// Admin: list purchasers for a category
router.get("/purchasers/:categoryId", getCategoryPurchasersCtrl);

// Admin: list all pending cash purchases
router.get("/pending", getPendingPurchasesCtrl);

// Vendor: list pending purchases
router.get("/pending/:vendorId", getVendorPendingPurchasesCtrl);

// Admin: approve or reject a pending purchase
router.put("/approve/:purchaseId", approvePurchaseCtrl);
router.put("/reject/:purchaseId", rejectPurchaseCtrl);

module.exports = router;