// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { getCountsCtrl, getVendorDashboardCtrl } = require("../controllers/dashboardDataCtrl");

// agar auth chahiye ho to middleware add kar do, warna seedha:
router.get("/stats", getCountsCtrl);
router.get("/vendor-stats/:id", getVendorDashboardCtrl);

module.exports = router;
