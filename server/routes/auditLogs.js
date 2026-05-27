const express = require("express");
const { createAuditCtrl, getAuditLogsCtrl } = require("../controllers/auditLogs");
const { verifyToken, isAdmin } = require("../utils/verifyToken");
const router = express.Router();


router.post("/create/:id", createAuditCtrl);

// Protected Admin Route - Only Admin can access audit logs
router.get("/getAll", verifyToken, isAdmin, getAuditLogsCtrl);

module.exports = router;
