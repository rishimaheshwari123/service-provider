const Device = require("../models/deviceModel");
const CommunicationLogs = require("../models/communicationLogs");
const Notification = require("../models/notificationModel");
const admin = require("../config/firebase");

// 1. Register/Update Device FCM Token
const registerDeviceCtrl = async (req, res) => {
  try {
    const { deviceId, fcmToken, userId, vendorId, isGuest, platform } = req.body;

    if (!deviceId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "deviceId and fcmToken are required."
      });
    }

    // Determine values to update
    const updateData = {
      fcmToken,
      platform: platform || "android",
      // If we got explicit userId/vendorId, we are no longer a guest
      isGuest: isGuest !== undefined ? isGuest : (!userId && !vendorId),
      userId: userId || null,
      vendorId: vendorId || null
    };

    const device = await Device.findOneAndUpdate(
      { deviceId },
      updateData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Device registered/updated successfully.",
      device
    });
  } catch (error) {
    console.error("Register Device Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while registering device.",
      error: error.message
    });
  }
};

// 2. Get Statistics of Registered Devices
const getNotificationStatsCtrl = async (req, res) => {
  try {
    const totalDevices = await Device.countDocuments();
    const guestDevices = await Device.countDocuments({ isGuest: true });
    const userDevices = await Device.countDocuments({ userId: { $ne: null } });
    const vendorDevices = await Device.countDocuments({ vendorId: { $ne: null } });

    return res.status(200).json({
      success: true,
      stats: {
        totalDevices,
        guestDevices,
        userDevices,
        vendorDevices
      }
    });
  } catch (error) {
    console.error("Get Notification Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching stats.",
      error: error.message
    });
  }
};

// 3. Send Push Notification (Multicast/Targeted) + Save to DB
const sendPushNotificationCtrl = async (req, res) => {
  try {
    const { title, body, imageUrl, targetType, targetIds, type, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and Body are required."
      });
    }

    // Acknowledge if firebase admin is not initialized
    if (!admin || !admin.apps.length) {
      return res.status(503).json({
        success: false,
        message: "Firebase Admin is not initialized. Please verify Firebase credentials on the server."
      });
    }

    let query = {};
    const selectedTarget = targetType || "all";

    // Build Mongoose Query based on targetType
    switch (selectedTarget) {
      case "users":
        query = { userId: { $ne: null } };
        break;
      case "vendors":
        query = { vendorId: { $ne: null } };
        break;
      case "guests":
        query = { isGuest: true };
        break;
      case "specific":
        if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: "targetIds array is required when targeting specific users."
          });
        }
        query = {
          $or: [
            { userId: { $in: targetIds } },
            { vendorId: { $in: targetIds } }
          ]
        };
        break;
      case "all":
      default:
        query = {};
        break;
    }

    // Find registered devices matching query
    const devices = await Device.find(query, "fcmToken userId vendorId isGuest");
    
    // Extract and de-duplicate tokens
    const tokens = [...new Set(devices.map(d => d.fcmToken).filter(Boolean))];

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active device tokens found for targeting category: ${selectedTarget}`
      });
    }

    // 🔥 STEP 1: SAVE NOTIFICATIONS TO DATABASE
    const notificationsToSave = [];
    
    if (selectedTarget === "guests") {
      // For guests, create one notification marked as isForGuest
      notificationsToSave.push({
        title,
        body,
        type,
        data,
        isForGuest: true
      });
    } else {
      // For users/vendors/specific, create individual notification records
      const uniqueRecipients = new Map();
      
      devices.forEach(device => {
        if (device.userId) {
          uniqueRecipients.set(device.userId.toString(), { userId: device.userId });
        } else if (device.vendorId) {
          uniqueRecipients.set(device.vendorId.toString(), { vendorId: device.vendorId });
        }
      });
      
      uniqueRecipients.forEach((recipient) => {
        notificationsToSave.push({
          title,
          body,
          type,
          data,
          ...recipient
        });
      });
    }

    // Bulk insert notifications to DB
    let savedNotifications = [];
    try {
      savedNotifications = await Notification.insertMany(notificationsToSave);
      console.log(`✅ Saved ${savedNotifications.length} notification(s) to database.`);
    } catch (dbError) {
      console.error("❌ Failed to save notifications to DB:", dbError);
      // Continue with FCM sending even if DB save fails
    }

    // 🔥 STEP 2: SEND VIA FCM
    let overallSuccessCount = 0;
    let overallFailureCount = 0;
    const errors = [];

    // Chunk tokens into groups of 500 (Firebase Multicast limit)
    const chunkSize = 500;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const tokenChunk = tokens.slice(i, i + chunkSize);

      const messagePayload = {
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl })
        },
        android: {
          notification: {
            title,
            body,
            ...(imageUrl && { imageUrl }),
            sound: "default"
          }
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: "default",
              "mutable-content": 1
            }
          },
          ...(imageUrl && {
            fcm_options: {
              image: imageUrl
            }
          })
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title,
          body,
          ...(type && { type }),
          ...(imageUrl && { imageUrl }),
          ...(data && typeof data === 'object' ? data : {})
        },
        tokens: tokenChunk
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(messagePayload);
        overallSuccessCount += response.successCount;
        overallFailureCount += response.failureCount;

        // Collect error details and remove invalid/stale tokens
        if (response.failureCount > 0) {
          const invalidTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errCode = resp.error?.code || "";
              errors.push({
                token: tokenChunk[idx].substring(0, 15) + "...",
                error: resp.error ? resp.error.message : "Unknown error"
              });

              // Remove tokens that are permanently invalid
              if (
                errCode === "messaging/invalid-registration-token" ||
                errCode === "messaging/registration-token-not-registered" ||
                errCode === "messaging/sender-id-mismatch" ||
                (resp.error?.message || "").toLowerCase().includes("senderid mismatch") ||
                (resp.error?.message || "").toLowerCase().includes("not registered")
              ) {
                invalidTokens.push(tokenChunk[idx]);
              }
            }
          });

          // Bulk delete stale tokens from DB
          if (invalidTokens.length > 0) {
            await Device.deleteMany({ fcmToken: { $in: invalidTokens } });
            console.log(`🗑️ Removed ${invalidTokens.length} invalid FCM token(s) from DB.`);
          }
        }
      } catch (fcmError) {
        console.error("Chunk Sending Error:", fcmError);
        overallFailureCount += tokenChunk.length;
        errors.push({ error: fcmError.message });
      }
    }

    // Log this notification in CommunicationLogs
    try {
      const logEntry = new CommunicationLogs({
        type: "PushNotification",
        purpose: "Notification",
        recipient: {
          name: `Target: ${selectedTarget.toUpperCase()}`,
          email: `${tokens.length} Devices Targeted`
        },
        message: `[${title}] ${body}`,
        status: overallSuccessCount > 0 ? "Success" : "Failed",
        response: {
          totalDevicesTargeted: tokens.length,
          successCount: overallSuccessCount,
          failureCount: overallFailureCount,
          notificationsSaved: savedNotifications.length,
          errors: errors.slice(0, 10)
        }
      });
      await logEntry.save();
    } catch (logError) {
      console.error("Failed to write to CommunicationLogs:", logError);
    }

    return res.status(200).json({
      success: true,
      message: `Notification processed. Sent successfully to ${overallSuccessCount} devices out of ${tokens.length}.`,
      stats: {
        totalTargeted: tokens.length,
        successCount: overallSuccessCount,
        failureCount: overallFailureCount,
        notificationsSaved: savedNotifications.length,
        errors: errors.slice(0, 20)
      }
    });
  } catch (error) {
    console.error("Send Push Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending push notifications.",
      error: error.message
    });
  }
};

// 4. Get recent Push Notification logs
const getNotificationLogsCtrl = async (req, res) => {
  try {
    const logs = await CommunicationLogs.find({ type: "PushNotification" })
      .sort({ createdAt: -1 })
      .limit(50); // get last 50 notification runs

    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    console.error("Get Notification Logs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching logs.",
      error: error.message
    });
  }
};

// 🔥 5. Get User/Vendor Notifications (with pagination)
const getUserNotificationsCtrl = async (req, res) => {
  try {
    const { userId, vendorId, isGuest } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Determine target
    if (isGuest === "true") {
      query.isForGuest = true;
    } else if (userId) {
      query.userId = userId;
    } else if (vendorId) {
      query.vendorId = vendorId;
    } else {
      return res.status(400).json({
        success: false,
        message: "userId, vendorId, or isGuest parameter required."
      });
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error("Get User Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
      error: error.message
    });
  }
};

// 🔥 6. Mark Single Notification as Read
const markNotificationAsReadCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification
    });
  } catch (error) {
    console.error("Mark Notification as Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking notification as read.",
      error: error.message
    });
  }
};

// 🔥 7. Mark All Notifications as Read
const markAllNotificationsAsReadCtrl = async (req, res) => {
  try {
    const { userId, vendorId } = req.body;

    if (!userId && !vendorId) {
      return res.status(400).json({
        success: false,
        message: "userId or vendorId is required."
      });
    }

    const query = { isRead: false };
    if (userId) query.userId = userId;
    if (vendorId) query.vendorId = vendorId;

    const result = await Notification.updateMany(query, { isRead: true });

    return res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notification(s) as read.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Mark All Notifications as Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read.",
      error: error.message
    });
  }
};

// 🔥 8. Get Unread Notification Count
const getUnreadCountCtrl = async (req, res) => {
  try {
    const { userId, vendorId, isGuest } = req.query;

    let query = { isRead: false };

    if (isGuest === "true") {
      query.isForGuest = true;
    } else if (userId) {
      query.userId = userId;
    } else if (vendorId) {
      query.vendorId = vendorId;
    } else {
      return res.status(400).json({
        success: false,
        message: "userId, vendorId, or isGuest parameter required."
      });
    }

    const count = await Notification.countDocuments(query);

    return res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching unread count.",
      error: error.message
    });
  }
};

// 🔥 9. Delete Notification
const deleteNotificationCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully."
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification.",
      error: error.message
    });
  }
};

// 🔥 10. Delete All Notifications for User/Vendor
const deleteAllNotificationsCtrl = async (req, res) => {
  try {
    const { userId, vendorId } = req.body;

    if (!userId && !vendorId) {
      return res.status(400).json({
        success: false,
        message: "userId or vendorId is required."
      });
    }

    const query = {};
    if (userId) query.userId = userId;
    if (vendorId) query.vendorId = vendorId;

    const result = await Notification.deleteMany(query);

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} notification(s).`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Delete All Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notifications.",
      error: error.message
    });
  }
};

module.exports = {
  registerDeviceCtrl,
  getNotificationStatsCtrl,
  sendPushNotificationCtrl,
  getNotificationLogsCtrl,
  getUserNotificationsCtrl,
  markNotificationAsReadCtrl,
  markAllNotificationsAsReadCtrl,
  getUnreadCountCtrl,
  deleteNotificationCtrl,
  deleteAllNotificationsCtrl
};
