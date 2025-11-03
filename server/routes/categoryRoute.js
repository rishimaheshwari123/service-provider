const express = require("express");
const {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  purchaseCategoryCtrl,
  getPurchasedCategoriesCtrl,
  updateCategoryCtrl,
  getCategoryPurchasersCtrl,
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

module.exports = router;