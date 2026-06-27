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
const { bulkUpdateCategoryReferences } = require("../utils/updateCategoryReferences");
const { verifyToken, isAdmin } = require("../utils/verifyToken");

const router = express.Router();

// Admin: create category
router.post("/create", verifyToken, createCategoryCtrl);

// Admin: update category
router.put("/update/:id", verifyToken, updateCategoryCtrl);

// Admin: delete category
router.delete("/delete/:id", verifyToken, deleteCategoryCtrl);

// Public: list categories
router.get("/getAll", getAllCategoriesCtrl);

// Vendor: purchase a category
router.post("/purchase", verifyToken, purchaseCategoryCtrl);

// Vendor: list purchased categories
router.get("/purchased/:vendorId", getPurchasedCategoriesCtrl);

// Admin: list purchasers for a category
router.get("/purchasers/:categoryId", getCategoryPurchasersCtrl);

// Admin: list all pending cash purchases
router.get("/pending", getPendingPurchasesCtrl);

// Vendor: list pending purchases
router.get("/pending/:vendorId", getVendorPendingPurchasesCtrl);

// Admin: approve or reject a pending purchase
router.put("/approve/:purchaseId", verifyToken, isAdmin, approvePurchaseCtrl);
router.put("/reject/:purchaseId", verifyToken, isAdmin, rejectPurchaseCtrl);

// Utility: Bulk update category references
router.post("/bulk-update-references", verifyToken, async (req, res) => {
  try {
    const { updates } = req.body; // Array of {oldName, newName} objects
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required"
      });
    }
    
    const result = await bulkUpdateCategoryReferences(updates);
    
    return res.status(200).json({
      success: true,
      message: `Bulk update completed. ${result.totalUpdated} properties updated.`,
      result
    });
  } catch (error) {
    console.error("Error in bulk category update:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating category references",
      error: error.message
    });
  }
});

// Utility: Create properties for existing purchases (one-time use)
router.post("/create-properties-for-existing", verifyToken, async (req, res) => {
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