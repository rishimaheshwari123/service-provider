const express = require("express");
const {
  createSearchLog,
  getAllSearchLogs,
  getSearchStats,
  downloadSearchLogs,
} = require("../controllers/searchLogsCtrl");

const router = express.Router();

// Public route - anyone can log searches
router.post("/create", createSearchLog);

// Admin routes - no auth middleware for now (add if needed)
router.get("/", getAllSearchLogs);
router.get("/stats", getSearchStats);
router.get("/download", downloadSearchLogs);

module.exports = router;
