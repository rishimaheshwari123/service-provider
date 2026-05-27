// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { getCountsCtrl, getVendorDashboardCtrl } = require("../controllers/dashboardDataCtrl");
const { verifyToken, isAdmin, isVendor } = require("../utils/verifyToken");

// Protected Routes
// Admin can see all stats
router.get("/stats", verifyToken, isAdmin, getCountsCtrl);

// Vendor can see only their own dashboard stats
router.get("/vendor-stats/:id", verifyToken, isVendor, getVendorDashboardCtrl);

module.exports = router;
