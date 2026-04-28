const express = require("express");
const router = express.Router();
const rewardCtrl = require("../controllers/rewardCtrl");
const { verifyToken, isAdmin, isVendor } = require("../utils/verifyToken");

// ==================== ADMIN ROUTES ====================

// Reward Settings
router.get("/admin/settings", verifyToken, isAdmin, rewardCtrl.getRewardSettings);
router.put("/admin/settings", verifyToken, isAdmin, rewardCtrl.updateRewardSettings);

// Reward Applications (Redemptions)
router.get("/admin/applications", verifyToken, isAdmin, rewardCtrl.getAllRewardApplications);

// Get Vendor Applied Codes History (Admin)
router.get("/admin/vendor-history/:vendorId", verifyToken, isAdmin, rewardCtrl.getVendorAppliedCodesAdmin);

// Statistics
router.get("/admin/statistics", verifyToken, isAdmin, rewardCtrl.getRewardStatistics);

// ==================== USER ROUTES ====================

// Get user reward points
router.get("/user/points", verifyToken, rewardCtrl.getUserRewardPoints);

// Get user reward history
router.get("/user/history", verifyToken, rewardCtrl.getUserRewardHistory);

// Generate redeem code
router.post("/user/generate-code", verifyToken, rewardCtrl.generateRedeemCode);

// Get user redeem codes
router.get("/user/redeem-codes", verifyToken, rewardCtrl.getUserRedeemCodes);

// App download reward (public endpoint - called by mobile app)
router.post("/user/download-reward", rewardCtrl.appDownloadReward);

// ==================== VENDOR ROUTES ====================

// Verify redeem code (without applying)
router.post("/vendor/verify-code", verifyToken, isVendor, rewardCtrl.verifyRedeemCode);

// Apply redeem code
router.post("/vendor/apply-code", verifyToken, isVendor, rewardCtrl.applyRedeemCode);

// Get vendor applied codes history
router.get("/vendor/applied-codes", verifyToken, isVendor, rewardCtrl.getVendorAppliedCodes);

// Check vendor reward settings
router.get("/vendor/settings", verifyToken, isVendor, rewardCtrl.checkVendorRewardSettings);

module.exports = router;
