const express = require("express");
const router = express.Router();
const { getAllLogs, getStats, downloadLogs } = require("../controllers/communicationLogsCtrl");

// Get all logs (with filters)
router.get("/", getAllLogs);

// Get stats
router.get("/stats", getStats);

// Download logs as Excel
router.get("/download", downloadLogs);

module.exports = router;
