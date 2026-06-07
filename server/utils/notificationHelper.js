const admin = require('../config/firebase');
const User = require('../models/authModel');

/**
 * Check if Firebase Admin is initialized
 */
function checkFirebaseInitialized() {
  if (!admin.isInitialized || !admin.isInitialized()) {
    throw new Error('Firebase Admin is not initialized. Please verify Firebase credentials on the server.');
  }
}

/**
 * Send notification to a single user
 * @param {String} userId - User ID
 * @param {Object} notification - Notification object with title and body
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} Response from FCM
 */
async function sendNotificationToUser(userId, notification, data = {}) {
  try {
    // Check Firebase initialization
    checkFirebaseInitialized();
    
    const user = await User.findById(userId);
    
    if (!user || !user.fcmToken) {
      console.log(`User ${userId} has no FCM token`);
      return { success: false, message: 'No FCM token found' };
    }
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/favicon.ico'
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      token: user.fcmToken
    };
    
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully to user:', userId, response);
    
    return { success: true, response };
  } catch (error) {
    console.error('Error sending notification to user:', userId, error);
    
    // If token is invalid or expired, remove it from user
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      await User.findByIdAndUpdate(userId, { fcmToken: null });
      console.log(`Removed invalid FCM token for user: ${userId}`);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to multiple users
 * @param {Array<String>} userIds - Array of user IDs
 * @param {Object} notification - Notification object with title and body
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<Object>} Response with success and failure counts
 */
async function sendNotificationToMultipleUsers(userIds, notification, data = {}) {
  try {
    // Check Firebase initialization
    checkFirebaseInitialized();
    
    const users = await User.find({ 
      _id: { $in: userIds }, 
      fcmToken: { $ne: null } 
    });
    
    if (users.length === 0) {
      console.log('No users with FCM tokens found');
      return { success: false, message: 'No users with FCM tokens' };
    }
    
    const tokens = users.map(user => user.fcmToken);
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/favicon.ico'
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens: tokens
    };
    
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
    
    // Handle invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (error.code === 'messaging/invalid-registration-token' || 
              error.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokens[idx]);
          }
        }
      });
      
      // Remove invalid tokens
      if (invalidTokens.length > 0) {
        await User.updateMany(
          { fcmToken: { $in: invalidTokens } },
          { fcmToken: null }
        );
        console.log(`Removed ${invalidTokens.length} invalid FCM tokens`);
      }
    }
    
    return { 
      success: true, 
      successCount: response.successCount, 
      failureCount: response.failureCount 
    };
  } catch (error) {
    console.error('Error sending notifications to multiple users:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking confirmation notification
 */
async function sendBookingConfirmation(userId, bookingDetails) {
  return await sendNotificationToUser(
    userId,
    {
      title: '🎉 Booking Confirmed!',
      body: `Your booking for ${bookingDetails.serviceName} has been confirmed.`
    },
    {
      type: 'booking_confirmation',
      bookingId: bookingDetails._id.toString(),
      url: `/bookings/${bookingDetails._id}`
    }
  );
}

/**
 * Send booking cancellation notification
 */
async function sendBookingCancellation(userId, bookingDetails) {
  return await sendNotificationToUser(
    userId,
    {
      title: '❌ Booking Cancelled',
      body: `Your booking for ${bookingDetails.serviceName} has been cancelled.`
    },
    {
      type: 'booking_cancellation',
      bookingId: bookingDetails._id.toString(),
      url: `/bookings/${bookingDetails._id}`
    }
  );
}

/**
 * Send booking reminder notification
 */
async function sendBookingReminder(userId, bookingDetails) {
  return await sendNotificationToUser(
    userId,
    {
      title: '⏰ Booking Reminder',
      body: `Your service "${bookingDetails.serviceName}" is scheduled for ${bookingDetails.date}.`
    },
    {
      type: 'booking_reminder',
      bookingId: bookingDetails._id.toString(),
      url: `/bookings/${bookingDetails._id}`
    }
  );
}

/**
 * Send service provider assignment notification
 */
async function sendVendorAssignment(vendorId, bookingDetails) {
  return await sendNotificationToUser(
    vendorId,
    {
      title: '🆕 New Booking Assigned',
      body: `You have been assigned a new booking for ${bookingDetails.serviceName}.`
    },
    {
      type: 'vendor_assignment',
      bookingId: bookingDetails._id.toString(),
      url: `/vendor/bookings/${bookingDetails._id}`
    }
  );
}

/**
 * Send payment success notification
 */
async function sendPaymentSuccess(userId, paymentDetails) {
  return await sendNotificationToUser(
    userId,
    {
      title: '✅ Payment Successful',
      body: `Your payment of ₹${paymentDetails.amount} has been processed successfully.`
    },
    {
      type: 'payment_success',
      paymentId: paymentDetails._id.toString(),
      amount: paymentDetails.amount.toString(),
      url: `/payments/${paymentDetails._id}`
    }
  );
}

/**
 * Send promotional notification to multiple users
 */
async function sendPromotionalNotification(userIds, promotion) {
  return await sendNotificationToMultipleUsers(
    userIds,
    {
      title: promotion.title || '🎁 Special Offer!',
      body: promotion.body
    },
    {
      type: 'promotion',
      promotionId: promotion._id?.toString(),
      url: promotion.url || '/promotions'
    }
  );
}

/**
 * Send welcome notification to new user
 */
async function sendWelcomeNotification(userId, userName) {
  return await sendNotificationToUser(
    userId,
    {
      title: '👋 Welcome!',
      body: `Hi ${userName}! Thanks for joining us. Start exploring our services now.`
    },
    {
      type: 'welcome',
      url: '/services'
    }
  );
}

/**
 * Send review request notification
 */
async function sendReviewRequest(userId, bookingDetails) {
  return await sendNotificationToUser(
    userId,
    {
      title: '⭐ Rate Your Experience',
      body: `How was your experience with ${bookingDetails.serviceName}? Share your feedback!`
    },
    {
      type: 'review_request',
      bookingId: bookingDetails._id.toString(),
      url: `/bookings/${bookingDetails._id}/review`
    }
  );
}

module.exports = {
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReminder,
  sendVendorAssignment,
  sendPaymentSuccess,
  sendPromotionalNotification,
  sendWelcomeNotification,
  sendReviewRequest
};
