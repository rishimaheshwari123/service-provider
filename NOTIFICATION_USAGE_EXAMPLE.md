# Firebase Notification Usage Examples

## Example: Sending Notifications from Booking Controller

Here's how to integrate notifications into your existing booking flow:

### 1. Import Notification Helper

```javascript
// At the top of server/controllers/bookingCtrl.js
const {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendVendorAssignment,
  sendBookingReminder
} = require('../utils/notificationHelper');
```

### 2. Send Notification on Booking Creation

```javascript
// In your booking creation function
const createBooking = async (req, res) => {
  try {
    // ... existing booking creation code ...
    
    const newBooking = await Booking.create({
      userId: req.user._id,
      serviceName: req.body.serviceName,
      // ... other booking fields
    });
    
    // Send confirmation notification to user
    await sendBookingConfirmation(req.user._id, {
      _id: newBooking._id,
      serviceName: newBooking.serviceName
    });
    
    // If vendor is assigned, notify them too
    if (newBooking.vendorId) {
      await sendVendorAssignment(newBooking.vendorId, {
        _id: newBooking._id,
        serviceName: newBooking.serviceName
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking
    });
  } catch (error) {
    // ... error handling
  }
};
```

### 3. Send Notification on Booking Cancellation

```javascript
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Send cancellation notification
    await sendBookingCancellation(booking.userId, {
      _id: booking._id,
      serviceName: booking.serviceName
    });
    
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    // ... error handling
  }
};
```

### 4. Schedule Booking Reminders

```javascript
// Create a scheduled job (using node-cron or similar)
const cron = require('node-cron');
const { sendBookingReminder } = require('./utils/notificationHelper');
const Booking = require('./models/BookingModel');

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    
    // Find bookings scheduled for tomorrow
    const upcomingBookings = await Booking.find({
      scheduledDate: {
        $gte: tomorrow,
        $lte: endOfTomorrow
      },
      status: 'confirmed'
    });
    
    // Send reminders
    for (const booking of upcomingBookings) {
      await sendBookingReminder(booking.userId, {
        _id: booking._id,
        serviceName: booking.serviceName,
        date: booking.scheduledDate.toLocaleDateString()
      });
    }
    
    console.log(`Sent ${upcomingBookings.length} booking reminders`);
  } catch (error) {
    console.error('Error sending booking reminders:', error);
  }
});
```

## Example: Payment Notifications

```javascript
// In server/controllers/paymentRazorpayCtrl.js
const { sendPaymentSuccess } = require('../utils/notificationHelper');

const verifyPayment = async (req, res) => {
  try {
    // ... existing payment verification code ...
    
    if (isPaymentValid) {
      // Send payment success notification
      await sendPaymentSuccess(req.user._id, {
        _id: payment._id,
        amount: payment.amount
      });
      
      res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    }
  } catch (error) {
    // ... error handling
  }
};
```

## Example: Welcome Notification on Registration

```javascript
// In server/controllers/authCtrl.js
const { sendWelcomeNotification } = require('../utils/notificationHelper');

const registerCtrl = async (req, res) => {
  try {
    // ... existing registration code ...
    
    const newUser = await authModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      // ... other fields
    });
    
    // Send welcome notification (will send when user enables notifications)
    // This is non-blocking, so registration continues even if notification fails
    sendWelcomeNotification(newUser._id, newUser.name).catch(err => {
      console.error('Failed to send welcome notification:', err);
    });
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser
    });
  } catch (error) {
    // ... error handling
  }
};
```

## Example: Review Request After Service Completion

```javascript
// In server/controllers/bookingCtrl.js
const { sendReviewRequest } = require('../utils/notificationHelper');

const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    booking.status = 'completed';
    await booking.save();
    
    // Send review request 1 hour after completion
    setTimeout(async () => {
      await sendReviewRequest(booking.userId, {
        _id: booking._id,
        serviceName: booking.serviceName
      });
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    res.status(200).json({
      success: true,
      message: "Booking marked as completed"
    });
  } catch (error) {
    // ... error handling
  }
};
```

## Example: Promotional Notifications to Multiple Users

```javascript
// In server/controllers/couponCtrl.js or create a new notification controller
const { sendPromotionalNotification } = require('../utils/notificationHelper');
const User = require('../models/authModel');

const sendPromotionalCoupon = async (req, res) => {
  try {
    const { title, body, url, targetRole } = req.body;
    
    // Get all users who want promotional notifications
    const query = {
      'notificationPreferences.promotions': true,
      fcmToken: { $ne: null }
    };
    
    if (targetRole) {
      query.role = targetRole;
    }
    
    const users = await User.find(query).select('_id');
    const userIds = users.map(user => user._id);
    
    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users to notify"
      });
    }
    
    const result = await sendPromotionalNotification(userIds, {
      title,
      body,
      url
    });
    
    res.status(200).json({
      success: true,
      message: `Sent to ${result.successCount} users`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending promotional notification",
      error: error.message
    });
  }
};
```

## Best Practices

1. **Always use try-catch** when sending notifications to prevent errors from breaking your main flow
2. **Non-blocking notifications**: Don't wait for notification sending to complete before responding to the user
3. **Check user preferences**: Respect notification preferences before sending
4. **Handle invalid tokens**: The helper automatically removes invalid FCM tokens
5. **Add meaningful data**: Include URLs and IDs so users can navigate directly to relevant content
6. **Test thoroughly**: Use Firebase Console test messages during development

## Error Handling Pattern

```javascript
// Recommended pattern for all notification calls
try {
  await sendBookingConfirmation(userId, bookingDetails);
} catch (notificationError) {
  // Log but don't fail the main operation
  console.error('Failed to send notification:', notificationError);
  // Optionally: save to a retry queue
}
```

## Testing Your Implementation

1. Enable notifications in your frontend
2. Get your FCM token from browser console
3. Test with Firebase Console (Cloud Messaging > Send test message)
4. Test your backend notification functions
5. Verify notifications appear both in foreground and background

---

For complete setup instructions, see `FIREBASE_NOTIFICATION_SETUP.md`
