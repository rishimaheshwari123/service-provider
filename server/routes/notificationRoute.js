const express = require("express");
const router = express.Router();
const {
  registerDeviceCtrl,
  getNotificationStatsCtrl,
  sendPushNotificationCtrl,
  getNotificationLogsCtrl,
  getUserNotificationsCtrl,
  markNotificationAsReadCtrl,
  markAllNotificationsAsReadCtrl,
  getUnreadCountCtrl,
  deleteNotificationCtrl,
  deleteAllNotificationsCtrl,
  getTopicsCtrl,
  createTopicCtrl,
  updateTopicCtrl,
  deleteTopicCtrl,
  subscribeToTopicCtrl,
  unsubscribeFromTopicCtrl,
  getDevicesCtrl
} = require("../controllers/notificationCtrl");
const { verifyToken, isAdmin } = require("../utils/verifyToken");

// ========================================
// PUBLIC ROUTES
// ========================================

// Device Registration (both guests and logged-in users/vendors)
router.post("/register-device", registerDeviceCtrl);

// Topic manual subscribe/unsubscribe (Accessible by client apps)
router.post("/topics/subscribe", subscribeToTopicCtrl);
router.post("/topics/unsubscribe", unsubscribeFromTopicCtrl);

// ========================================
// USER/VENDOR ROUTES (Public - query params se identify hoga)
// ========================================

// Get notifications - GET /api/v1/notifications?userId=xxx or vendorId=xxx or isGuest=true
router.get("/", getUserNotificationsCtrl);

// Mark single notification as read - POST /api/v1/notifications/:id/read
router.post("/:id/read", markNotificationAsReadCtrl);

// Mark all notifications as read - POST /api/v1/notifications/mark-all-read
router.post("/mark-all-read", markAllNotificationsAsReadCtrl);

// Get unread count - GET /api/v1/notifications/unread-count?userId=xxx
router.get("/unread-count", getUnreadCountCtrl);

// Delete single notification - DELETE /api/v1/notifications/:id
router.delete("/:id", deleteNotificationCtrl);

// Delete all notifications - POST /api/v1/notifications/delete-all
router.post("/delete-all", deleteAllNotificationsCtrl);

// ========================================
// ADMIN ROUTES (Protected)
// ========================================

// Get device statistics
router.get("/stats", verifyToken, isAdmin, getNotificationStatsCtrl);

// Get all registered devices
router.get("/devices", verifyToken, isAdmin, getDevicesCtrl);

// Send push notification
router.post("/send", verifyToken, isAdmin, sendPushNotificationCtrl);

// Get notification logs
router.get("/logs", verifyToken, isAdmin, getNotificationLogsCtrl);

// Topic management (Admin)
router.get("/topics", verifyToken, isAdmin, getTopicsCtrl);
router.post("/topics", verifyToken, isAdmin, createTopicCtrl);
router.put("/topics/:id", verifyToken, isAdmin, updateTopicCtrl);
router.delete("/topics/:id", verifyToken, isAdmin, deleteTopicCtrl);

module.exports = router;
