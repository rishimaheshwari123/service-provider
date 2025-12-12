const express = require("express");
const { createAuditCtrl, getAuditLogsCtrl } = require("../controllers/auditLogs");
const router = express.Router();


router.post("/create/:id", createAuditCtrl);
router.get("/getAll", getAuditLogsCtrl);

module.exports = router;
