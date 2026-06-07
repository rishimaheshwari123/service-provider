const Device = require("../models/deviceModel");
const CommunicationLogs = require("../models/communicationLogs");
const Notification = require("../models/notificationModel");
const admin = require("../config/firebase");
const Topic = require("../models/topicModel");
const Auth = require("../models/authModel");
const Vendor = require("../models/vendorModel");

// Helper to evaluate criteria for a topic
const evaluateCriteria = (criteria, user, vendor) => {
  if (!criteria) return false;

  // Role filter
  if (criteria.role) {
    if (criteria.role === "vendor" && !vendor) return false;
    if (criteria.role === "user" && !user) return false;
    if (criteria.role === "admin" && (!user || user.role !== "admin")) return false;
  }

  // isVendor filter
  if (criteria.isVendor !== undefined) {
    const hasVendor = !!vendor;
    if (criteria.isVendor !== hasVendor) return false;
  }

  // isUser filter
  if (criteria.isUser !== undefined) {
    const hasUser = !!user && user.role !== "admin";
    if (criteria.isUser !== hasUser) return false;
  }

  // phoneVerified filter
  if (criteria.phoneVerified !== undefined) {
    const verified = user ? user.phoneVerified : (vendor ? vendor.isPhoneVerified : false);
    if (criteria.phoneVerified !== verified) return false;
  }

  // Vendor filters (only applicable if vendor exists)
  if (vendor) {
    if (criteria.category && vendor.category && vendor.category.toString() !== criteria.category.toString()) {
      return false;
    }
    if (criteria.serviceLocation && vendor.serviceLocation && !vendor.serviceLocation.toLowerCase().includes(criteria.serviceLocation.toLowerCase())) {
      return false;
    }
    if (criteria.pincode && vendor.pincode && vendor.pincode !== criteria.pincode) {
      return false;
    }
    if (criteria.selectedPriceTier && vendor.selectedPriceTier && vendor.selectedPriceTier !== criteria.selectedPriceTier) {
      return false;
    }
  } else {
    // If vendor filters are specified, but we don't have a vendor, it's not a match
    if (criteria.category || criteria.serviceLocation || criteria.pincode || criteria.selectedPriceTier) {
      return false;
    }
  }

  // Common filters (createdAfter, createdBefore)
  const createdAt = user ? new Date(user.createdAt) : (vendor ? new Date(vendor.createdAt) : null);
  if (createdAt) {
    if (criteria.createdAfter && createdAt < new Date(criteria.createdAfter)) return false;
    if (criteria.createdBefore && createdAt > new Date(criteria.createdBefore)) return false;
  }

  return true;
};

// Helper to subscribe device to qualifying topics
const subscribeDeviceToQualifyingTopics = async (device, fcmToken, userId, vendorId) => {
  try {
    if (!admin || !admin.apps.length) {
      console.log("Firebase not initialized. Skipping topic subscriptions.");
      return;
    }

    // Fetch active topics
    const activeTopics = await Topic.find({ isActive: true });
    if (activeTopics.length === 0) return;

    // Fetch user or vendor profile if present
    let user = null;
    let vendor = null;
    if (userId) {
      user = await Auth.findById(userId);
    }
    if (vendorId) {
      vendor = await Vendor.findById(vendorId);
    }

    const topicsToSubscribe = [];
    const topicNames = [];

    for (const topic of activeTopics) {
      let isMatch = false;

      if (topic.autoSubscribe) {
        if (!topic.criteria || Object.keys(topic.criteria).length === 0) {
          isMatch = true;
        } else {
          isMatch = evaluateCriteria(topic.criteria, user, vendor);
        }
      }

      if (isMatch) {
        topicsToSubscribe.push(topic);
        topicNames.push(topic.topicName);
      }
    }

    if (topicNames.length > 0) {
      try {
        // Subscribe to each topic in Firebase
        for (const topicName of topicNames) {
          await admin.messaging().subscribeToTopic(fcmToken, topicName);
        }
        console.log(`Successfully subscribed device ${device.deviceId} to topics:`, topicNames);

        // 1. Update topics inside device model in DB
        await Device.findOneAndUpdate(
          { deviceId: device.deviceId },
          { $addToSet: { topics: { $each: topicNames } } }
        );

        // 2. Increment subscriber count for these topics in DB
        for (const topic of topicsToSubscribe) {
          // Double check subscription counts
          await Topic.findByIdAndUpdate(topic._id, { $inc: { subscriberCount: 1 } });
        }
      } catch (fcmError) {
        console.error("Error subscribing to Firebase topics:", fcmError);
      }
    }
  } catch (err) {
    console.error("subscribeDeviceToQualifyingTopics error:", err);
  }
};

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

    // Trigger auto-subscription
    await subscribeDeviceToQualifyingTopics(device, fcmToken, userId, vendorId);

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
    const { title, body, imageUrl, targetType, targetIds, type, data, link } = req.body;

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
    const normalizedTargetType = String(targetType || "all").toLowerCase();
    const selectedTarget = normalizedTargetType === "guest" ? "guests" : normalizedTargetType;
    let topicName = null;
    let topicDisplayName = "";

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
      case "topic":
        if (!targetIds) {
          return res.status(400).json({
            success: false,
            message: "targetIds (Topic ID) is required when targeting a topic."
          });
        }
        const topicObj = await Topic.findById(targetIds);
        if (!topicObj) {
          return res.status(404).json({
            success: false,
            message: "Selected topic not found."
          });
        }
        topicName = topicObj.topicName;
        topicDisplayName = topicObj.displayName;
        query = { topics: topicName };
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

    // Prepare custom data with link
    const enrichedData = {
      ...(data && typeof data === 'object' ? data : {}),
      ...(link && { link })
    };

    // 🔥 STEP 1: SAVE NOTIFICATIONS TO DATABASE
    const notificationsToSave = [];
    const hasGuestDevices = devices.some(device => device.isGuest || (!device.userId && !device.vendorId));
    
    if (selectedTarget === "guests") {
      // For guests, create one notification marked as isForGuest
      notificationsToSave.push({
        title,
        body,
        ...(imageUrl && { imageUrl }),
        type,
        data: enrichedData,
        isForGuest: true
      });
    } else {
      // For users/vendors/specific/topics, create individual notification records
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
          ...(imageUrl && { imageUrl }),
          type,
          data: enrichedData,
          ...recipient
        });
      });

      // Keep a guest inbox record when the selected devices include guest devices.
      if (hasGuestDevices) {
        notificationsToSave.push({
          title,
          body,
          ...(imageUrl && { imageUrl }),
          type,
          data: enrichedData,
          isForGuest: true
        });
      }
    }

    // Bulk insert notifications to DB
    let savedNotifications = [];
    try {
      if (notificationsToSave.length > 0) {
        savedNotifications = await Notification.insertMany(notificationsToSave);
      }
      console.log(`✅ Saved ${savedNotifications.length} notification(s) to database.`);
    } catch (dbError) {
      console.error("❌ Failed to save notifications to DB:", dbError);
    }

    // 🔥 STEP 2: SEND VIA FCM
    let overallSuccessCount = 0;
    let overallFailureCount = 0;
    const errors = [];

    if (selectedTarget === "topic" && topicName) {
      // Send via Topic Directly (Single FCM Request)
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
          ...(link && { link }),
          ...(data && typeof data === 'object' ? data : {})
        },
        topic: topicName
      };

      try {
        const response = await admin.messaging().send(messagePayload);
        console.log(`✅ Topic broadcast sent successfully to: ${topicName}. Message ID: ${response}`);
        overallSuccessCount = tokens.length; // Approximate success as all subscribed devices
      } catch (fcmError) {
        console.error("❌ Topic sending error:", fcmError);
        overallFailureCount = tokens.length;
        errors.push({ error: fcmError.message });
      }
    } else {
      // Multicast sending to token list
      if (tokens.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No active device tokens found for targeting category: ${selectedTarget}`
        });
      }

      // Chunk tokens into groups of 500
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
            ...(link && { link }),
            ...(data && typeof data === 'object' ? data : {})
          },
          tokens: tokenChunk
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(messagePayload);
          overallSuccessCount += response.successCount;
          overallFailureCount += response.failureCount;

          if (response.failureCount > 0) {
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errCode = resp.error?.code || "";
                errors.push({
                  token: tokenChunk[idx].substring(0, 15) + "...",
                  error: resp.error ? resp.error.message : "Unknown error"
                });

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
    }

    // Log this notification in CommunicationLogs
    try {
      const recipientLabel = selectedTarget === "topic" 
        ? `Topic: ${topicDisplayName}` 
        : `Target: ${selectedTarget.toUpperCase()}`;

      const logEntry = new CommunicationLogs({
        type: "PushNotification",
        purpose: "Notification",
        recipient: {
          name: recipientLabel,
          email: `${tokens.length} Devices Targeted`
        },
        message: `[${title}] ${body}${link ? ` (Link: ${link})` : ""}`,
        status: overallSuccessCount > 0 ? "Success" : "Failed",
        response: {
          totalDevicesTargeted: tokens.length,
          successCount: overallSuccessCount,
          failureCount: overallFailureCount,
          notificationsSaved: savedNotifications.length,
          formData: {
            title,
            body,
            imageUrl: imageUrl || "",
            targetType: selectedTarget,
            targetIds: selectedTarget === "topic" ? targetIds : undefined,
            link: link || "",
            type: type || "",
            data: enrichedData
          },
          errors: errors.slice(0, 10)
        }
      });
      await logEntry.save();
    } catch (logError) {
      console.error("Failed to write to CommunicationLogs:", logError);
    }

    return res.status(200).json({
      success: true,
      message: selectedTarget === "topic"
        ? `Notification broadcasted to topic: ${topicDisplayName} successfully.`
        : `Notification processed. Sent successfully to ${overallSuccessCount} devices out of ${tokens.length}.`,
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

// 4. Get recent saved Push Notifications for admin history/load form
const getNotificationLogsCtrl = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const logs = notifications.map((notification) => {
      const link = notification.data?.link || "";
      const targetType = notification.isForGuest
        ? "guests"
        : notification.vendorId
          ? "vendors"
          : notification.userId
            ? "users"
            : "all";

      return {
        ...notification,
        recipient: {
          name: `Target: ${targetType.toUpperCase()}`,
          email: "Saved Notification"
        },
        message: `[${notification.title || ""}] ${notification.body || ""}`,
        status: "Success",
        response: {
          formData: {
            title: notification.title || "",
            body: notification.body || "",
            imageUrl: notification.imageUrl || "",
            targetType,
            link,
            type: notification.type || "",
            data: notification.data || {}
          }
        }
      };
    });

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
    const { userId, vendorId, isGuest } = req.body;

    if (!userId && !vendorId && isGuest !== true && isGuest !== "true") {
      return res.status(400).json({
        success: false,
        message: "userId, vendorId, or isGuest is required."
      });
    }

    const query = { isRead: false };
    if (isGuest === true || isGuest === "true") {
      query.isForGuest = true;
    } else if (userId) {
      query.userId = userId;
    } else if (vendorId) {
      query.vendorId = vendorId;
    }

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
    const { userId, vendorId, isGuest } = req.body;

    if (!userId && !vendorId && isGuest !== true && isGuest !== "true") {
      return res.status(400).json({
        success: false,
        message: "userId, vendorId, or isGuest is required."
      });
    }

    const query = {};
    if (isGuest === true || isGuest === "true") {
      query.isForGuest = true;
    } else if (userId) {
      query.userId = userId;
    } else if (vendorId) {
      query.vendorId = vendorId;
    }

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

// 🔥 11. Topic CRUD controllers
const getTopicsCtrl = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      topics
    });
  } catch (error) {
    console.error("Get Topics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching topics.",
      error: error.message
    });
  }
};

const createTopicCtrl = async (req, res) => {
  try {
    const { name, displayName, description, autoSubscribe, criteria } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Topic name and display name are required."
      });
    }

    const existing = await Topic.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A topic with this name already exists."
      });
    }

    const topic = new Topic({
      name,
      displayName,
      description,
      autoSubscribe,
      criteria
    });

    await topic.save();

    // Trigger background auto-subscription
    if (autoSubscribe) {
      setImmediate(async () => {
        try {
          const devices = await Device.find();
          let count = 0;
          for (const device of devices) {
            let user = null;
            let vendor = null;
            if (device.userId) user = await Auth.findById(device.userId);
            if (device.vendorId) vendor = await Vendor.findById(device.vendorId);

            let isMatch = false;
            if (!criteria || Object.keys(criteria).length === 0) {
              isMatch = true;
            } else {
              isMatch = evaluateCriteria(criteria, user, vendor);
            }

            if (isMatch && device.fcmToken) {
              if (admin && admin.apps.length) {
                await admin.messaging().subscribeToTopic(device.fcmToken, topic.topicName);
              }
              await Device.updateOne({ _id: device._id }, { $addToSet: { topics: topic.topicName } });
              count++;
            }
          }
          await Topic.findByIdAndUpdate(topic._id, { subscriberCount: count });
          console.log(`Auto-subscribed ${count} devices to new topic: ${topic.displayName}`);
        } catch (err) {
          console.error("Error auto-subscribing existing devices to new topic:", err);
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: "Topic created successfully.",
      topic
    });
  } catch (error) {
    console.error("Create Topic Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating topic.",
      error: error.message
    });
  }
};

const updateTopicCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, isActive, autoSubscribe, criteria } = req.body;

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found."
      });
    }

    if (displayName) topic.displayName = displayName;
    if (description !== undefined) topic.description = description;
    if (isActive !== undefined) topic.isActive = isActive;
    if (autoSubscribe !== undefined) topic.autoSubscribe = autoSubscribe;
    if (criteria !== undefined) topic.criteria = criteria;

    await topic.save();

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully.",
      topic
    });
  } catch (error) {
    console.error("Update Topic Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating topic.",
      error: error.message
    });
  }
};

const deleteTopicCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found."
      });
    }

    try {
      const devices = await Device.find({ topics: topic.topicName });
      for (const device of devices) {
        if (device.fcmToken && admin && admin.apps.length) {
          await admin.messaging().unsubscribeFromTopic(device.fcmToken, topic.topicName);
        }
      }
      await Device.updateMany(
        { topics: topic.topicName },
        { $pull: { topics: topic.topicName } }
      );
    } catch (unsubErr) {
      console.error("Error during topic deletion unsubscribe:", unsubErr);
    }

    return res.status(200).json({
      success: true,
      message: "Topic deleted successfully."
    });
  } catch (error) {
    console.error("Delete Topic Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting topic.",
      error: error.message
    });
  }
};

// 🔥 12. Subscribe Device to Topic manually
const subscribeToTopicCtrl = async (req, res) => {
  try {
    const { deviceId, fcmToken, topicId, topicName } = req.body;

    if (!deviceId && !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "Either deviceId or fcmToken is required."
      });
    }

    if (!topicId && !topicName) {
      return res.status(400).json({
        success: false,
        message: "Either topicId or topicName is required."
      });
    }

    // Find Device
    let device = null;
    if (deviceId) {
      device = await Device.findOne({ deviceId });
    }
    if (!device && fcmToken) {
      device = await Device.findOne({ fcmToken });
    }

    // If device doesn't exist, we register it automatically
    if (!device) {
      const activeDeviceId = deviceId || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const activeFcmToken = fcmToken || deviceId; // Fallback
      device = await Device.create({
        deviceId: activeDeviceId,
        fcmToken: activeFcmToken,
        isGuest: true,
        topics: []
      });
      console.log(`Auto-created device record for subscription: ${device.deviceId}`);
    }

    // Find Topic
    let topic = null;
    const mongoose = require("mongoose");
    const queryConditions = [];
    
    if (topicId) {
      if (mongoose.Types.ObjectId.isValid(topicId)) {
        queryConditions.push({ _id: topicId });
      }
      queryConditions.push({ topicName: topicId });
      queryConditions.push({ name: topicId });
    }
    
    if (topicName) {
      queryConditions.push({ topicName });
      queryConditions.push({ name: topicName });
    }

    topic = await Topic.findOne({ $or: queryConditions });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found."
      });
    }

    // Check if already subscribed
    if (device.topics.includes(topic.topicName)) {
      return res.status(200).json({
        success: true,
        message: `Device is already subscribed to topic: ${topic.displayName}`,
        device
      });
    }

    // Subscribe via Firebase
    if (admin && admin.apps.length && device.fcmToken) {
      try {
        await admin.messaging().subscribeToTopic(device.fcmToken, topic.topicName);
      } catch (fcmError) {
        console.error("Firebase subscribeToTopic error:", fcmError);
        return res.status(502).json({
          success: false,
          message: "Firebase error subscribing token to topic.",
          error: fcmError.message
        });
      }
    }

    // Update DB
    device.topics.addToSet(topic.topicName);
    await device.save();

    // Increment subscriber count
    topic.subscriberCount = (topic.subscriberCount || 0) + 1;
    await topic.save();

    return res.status(200).json({
      success: true,
      message: `Device successfully subscribed to topic: ${topic.displayName}`,
      device
    });
  } catch (error) {
    console.error("Subscribe to Topic Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while subscribing to topic.",
      error: error.message
    });
  }
};

// 🔥 13. Unsubscribe Device from Topic manually
const unsubscribeFromTopicCtrl = async (req, res) => {
  try {
    const { deviceId, fcmToken, topicId, topicName } = req.body;

    if (!deviceId && !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "Either deviceId or fcmToken is required."
      });
    }

    if (!topicId && !topicName) {
      return res.status(400).json({
        success: false,
        message: "Either topicId or topicName is required."
      });
    }

    // Find Device
    let device = null;
    if (deviceId) {
      device = await Device.findOne({ deviceId });
    }
    if (!device && fcmToken) {
      device = await Device.findOne({ fcmToken });
    }

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found."
      });
    }

    // Find Topic
    let topic = null;
    const mongoose = require("mongoose");
    const queryConditions = [];
    
    if (topicId) {
      if (mongoose.Types.ObjectId.isValid(topicId)) {
        queryConditions.push({ _id: topicId });
      }
      queryConditions.push({ topicName: topicId });
      queryConditions.push({ name: topicId });
    }
    
    if (topicName) {
      queryConditions.push({ topicName });
      queryConditions.push({ name: topicName });
    }

    topic = await Topic.findOne({ $or: queryConditions });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found."
      });
    }

    // Check if subscribed
    if (!device.topics.includes(topic.topicName)) {
      return res.status(200).json({
        success: true,
        message: `Device is not subscribed to topic: ${topic.displayName}`,
        device
      });
    }

    // Unsubscribe via Firebase
    if (admin && admin.apps.length && device.fcmToken) {
      try {
        await admin.messaging().unsubscribeFromTopic(device.fcmToken, topic.topicName);
      } catch (fcmError) {
        console.error("Firebase unsubscribeFromTopic error:", fcmError);
        return res.status(502).json({
          success: false,
          message: "Firebase error unsubscribing token from topic.",
          error: fcmError.message
        });
      }
    }

    // Update DB
    device.topics.pull(topic.topicName);
    await device.save();

    // Decrement subscriber count
    if (topic.subscriberCount > 0) {
      topic.subscriberCount -= 1;
      await topic.save();
    }

    return res.status(200).json({
      success: true,
      message: `Device successfully unsubscribed from topic: ${topic.displayName}`,
      device
    });
  } catch (error) {
    console.error("Unsubscribe from Topic Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while unsubscribing from topic.",
      error: error.message
    });
  }
};

// 🔥 14. Get all registered devices (Admin)
const getDevicesCtrl = async (req, res) => {
  try {
    const devices = await Device.find()
      .populate("userId", "name email phone role")
      .populate("vendorId", "name email phone company category")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      devices
    });
  } catch (error) {
    console.error("Get Devices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching devices.",
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
  deleteAllNotificationsCtrl,
  getTopicsCtrl,
  createTopicCtrl,
  updateTopicCtrl,
  deleteTopicCtrl,
  subscribeToTopicCtrl,
  unsubscribeFromTopicCtrl,
  getDevicesCtrl
};
