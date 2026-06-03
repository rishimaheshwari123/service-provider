const Device = require("../models/deviceModel");
const CommunicationLogs = require("../models/communicationLogs");
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

// 3. Send Push Notification (Multicast/Targeted)
const sendPushNotificationCtrl = async (req, res) => {
  try {
    const { title, body, imageUrl, targetType, targetIds } = req.body;

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
    const devices = await Device.find(query, "fcmToken");
    
    // Extact and de-duplicate tokens
    const tokens = [...new Set(devices.map(d => d.fcmToken).filter(Boolean))];

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active device tokens found for targeting category: ${selectedTarget}`
      });
    }

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
          ...(imageUrl && { imageUrl }) // base notification image (some platforms)
        },
        android: {
          notification: {
            title,
            body,
            ...(imageUrl && { imageUrl }), // Android rich notification image
            sound: "default"
          }
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: "default",
              "mutable-content": 1 // Required for iOS to download image
            }
          },
          ...(imageUrl && {
            fcm_options: {
              image: imageUrl // iOS FCM image
            }
          })
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title,
          body,
          ...(imageUrl && { imageUrl })
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
          errors: errors.slice(0, 10) // Limit to top 10 logged errors to save document size
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

module.exports = {
  registerDeviceCtrl,
  getNotificationStatsCtrl,
  sendPushNotificationCtrl,
  getNotificationLogsCtrl
};
