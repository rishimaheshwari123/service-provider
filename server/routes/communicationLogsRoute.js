const express = require("express");
const router = express.Router();
const { getAllLogs, getStats, downloadLogs } = require("../controllers/communicationLogsCtrl");
const { verifyToken, isAdmin } = require("../utils/verifyToken");

// Protected Admin Routes - Only Admin can access communication logs
router.get("/", verifyToken, isAdmin, getAllLogs);

// Get stats
router.get("/stats", verifyToken, isAdmin, getStats);

// Download logs as Excel
router.get("/download", verifyToken, isAdmin, downloadLogs);

module.exports = router;
