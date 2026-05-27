const express = require("express");
const {
  createSearchLog,
  getAllSearchLogs,
  getSearchStats,
  downloadSearchLogs,
} = require("../controllers/searchLogsCtrl");
const { verifyToken, isAdmin } = require("../utils/verifyToken");

const router = express.Router();

// Public route - anyone can log searches
router.post("/create", createSearchLog);

// Protected Admin Routes - Only Admin can access search logs
router.get("/", verifyToken, isAdmin, getAllSearchLogs);
router.get("/stats", verifyToken, isAdmin, getSearchStats);
router.get("/download", verifyToken, isAdmin, downloadSearchLogs);

module.exports = router;
