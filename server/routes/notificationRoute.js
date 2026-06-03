const express = require("express");
const router = express.Router();
const {
  registerDeviceCtrl,
  getNotificationStatsCtrl,
  sendPushNotificationCtrl,
  getNotificationLogsCtrl
} = require("../controllers/notificationCtrl");
const { verifyToken, isAdmin } = require("../utils/verifyToken");

// Public Device Registration (both guests and logged-in users/vendors register here)
router.post("/register-device", registerDeviceCtrl);

// Protected Admin Routes
router.get("/stats", verifyToken, isAdmin, getNotificationStatsCtrl);
router.post("/send", verifyToken, isAdmin, sendPushNotificationCtrl);
router.get("/logs", verifyToken, isAdmin, getNotificationLogsCtrl);

module.exports = router;
