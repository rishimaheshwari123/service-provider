const express = require("express");
const { verifyToken, isAdmin } = require("../utils/verifyToken");
const { getAllSystemAuditLogsCtrl } = require("../controllers/systemAuditLogs");
const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllSystemAuditLogsCtrl);

module.exports = router;
