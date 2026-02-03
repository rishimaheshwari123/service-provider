const express = require("express");
const {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  purchaseCategoryCtrl,
  getPurchasedCategoriesCtrl,
  updateCategoryCtrl,
  deleteCategoryCtrl,
  getCategoryPurchasersCtrl,
  getPendingPurchasesCtrl,
  getVendorPendingPurchasesCtrl,
  approvePurchaseCtrl,
  rejectPurchaseCtrl,
} = require("../controllers/categoryCtrl");

const { createPropertiesForExistingPurchases } = require("../utils/createPropertiesForExistingPurchases");

const router = express.Router();

// Admin: create category
router.post("/create", createCategoryCtrl);

// Admin: update category
router.put("/update/:id", updateCategoryCtrl);

// Admin: delete category
router.delete("/delete/:id", deleteCategoryCtrl);

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

// Utility: Create properties for existing purchases (one-time use)
router.post("/create-properties-for-existing", async (req, res) => {
  try {
    const result = await createPropertiesForExistingPurchases();
    return res.status(200).json({
      success: true,
      message: "Properties creation completed",
      result
    });
  } catch (error) {
    console.error("Error creating properties for existing purchases:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating properties",
      error: error.message
    });
  }
});

module.exports = router;