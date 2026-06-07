# Firebase Push Notifications Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in your application.

## ✅ What's Been Done

1. **Installed Firebase SDK** - Added `firebase` package to your project
2. **Created Firebase Configuration** - `src/lib/firebase.ts` with your Firebase credentials
3. **Created Service Worker** - `public/firebase-messaging-sw.js` for background notifications
4. **Created Custom Hook** - `src/hooks/useNotification.ts` for managing notifications
5. **Created Notification Prompt Component** - `src/components/NotificationPrompt.tsx` for requesting permissions

## 🔧 Required Steps to Complete Setup

### Step 1: Get Your VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mgsa-a4899**
3. Go to **Project Settings** > **Cloud Messaging** tab
4. Scroll to **Web Push certificates** section
5. If you don't have a key pair, click **Generate key pair**
6. Copy the **Key pair** value (starts with "B...")

### Step 2: Update VAPID Key

Open `src/hooks/useNotification.ts` and replace `YOUR_VAPID_KEY_HERE` with your actual VAPID key:

```typescript
const VAPID_KEY = 'YOUR_ACTUAL_VAPID_KEY_HERE';
```

### Step 3: Add NotificationPrompt to Your App

Open `src/App.tsx` and add the NotificationPrompt component:

```tsx
import { NotificationPrompt } from '@/components/NotificationPrompt';

function App() {
  return (
    <>
      {/* Your existing app content */}
      <NotificationPrompt />
    </>
  );
}
```

### Step 4: Store FCM Tokens in Backend

You'll need to store user FCM tokens in your database so you can send notifications later.

#### Update User Model (if not already done)

Add `fcmToken` field to your user schema:

```javascript
// In your user model
fcmToken: {
  type: String,
  default: null
}
```

#### Create API Endpoint to Save Token

```javascript
// In your authCtrl.js or create a new controller
exports.saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user._id; // Assuming you have auth middleware
    
    await User.findByIdAndUpdate(userId, { fcmToken });
    
    res.status(200).json({
      success: true,
      message: 'FCM token saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving FCM token',
      error: error.message
    });
  }
};
```

#### Update Frontend Hook to Send Token

In `src/hooks/useNotification.ts`, update the `requestPermission` function:

```typescript
// You can send the token to your backend here
await fetch('/api/auth/save-fcm-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourAuthToken}`
  },
  body: JSON.stringify({ fcmToken: token })
});
```

### Step 5: Send Notifications from Backend

Use the existing Firebase Admin SDK to send notifications:

```javascript
// Example: Send notification when booking is confirmed
const admin = require('../config/firebase');

async function sendBookingNotification(userId, bookingDetails) {
  try {
    const user = await User.findById(userId);
    
    if (!user.fcmToken) {
      console.log('User has no FCM token');
      return;
    }
    
    const message = {
      notification: {
        title: 'Booking Confirmed! 🎉',
        body: `Your booking for ${bookingDetails.serviceName} has been confirmed.`
      },
      data: {
        bookingId: bookingDetails._id.toString(),
        type: 'booking_confirmation',
        url: `/bookings/${bookingDetails._id}`
      },
      token: user.fcmToken
    };
    
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
```

## 🎯 Usage Examples

### In a React Component

```tsx
import { useNotification } from '@/hooks/useNotification';

function MyComponent() {
  const { fcmToken, isPermissionGranted, requestPermission } = useNotification();
  
  return (
    <div>
      {!isPermissionGranted && (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
      {fcmToken && <p>Token: {fcmToken}</p>}
    </div>
  );
}
```

### Sending Different Types of Notifications

```javascript
// Welcome notification
async function sendWelcomeNotification(userId) {
  const user = await User.findById(userId);
  if (!user.fcmToken) return;
  
  await admin.messaging().send({
    notification: {
      title: 'Welcome! 👋',
      body: 'Thanks for joining us!'
    },
    token: user.fcmToken
  });
}

// Booking reminder
async function sendBookingReminder(userId, bookingDetails) {
  const user = await User.findById(userId);
  if (!user.fcmToken) return;
  
  await admin.messaging().send({
    notification: {
      title: 'Booking Reminder ⏰',
      body: `Your service is scheduled for ${bookingDetails.date}`
    },
    data: {
      bookingId: bookingDetails._id.toString(),
      type: 'reminder'
    },
    token: user.fcmToken
  });
}

// Send to multiple users
async function sendToMultipleUsers(userIds, notification) {
  const users = await User.find({ _id: { $in: userIds }, fcmToken: { $ne: null } });
  const tokens = users.map(user => user.fcmToken);
  
  if (tokens.length === 0) return;
  
  await admin.messaging().sendEachForMulticast({
    notification: notification,
    tokens: tokens
  });
}
```

## 🧪 Testing Notifications

### 1. Test with Firebase Console

1. Go to Firebase Console > Cloud Messaging
2. Click **Send your first message**
3. Enter title and text
4. Click **Send test message**
5. Enter your FCM token
6. Click **Test**

### 2. Test Locally

Open browser console and run:

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check notification permission
console.log('Notification Permission:', Notification.permission);
```

## 🔒 Security Best Practices

1. **Never commit VAPID keys to public repositories**
2. Store FCM tokens securely in your database
3. Implement rate limiting for notification sending
4. Validate user permissions before sending notifications
5. Allow users to opt-out of notifications

## 📱 Browser Support

- Chrome 50+
- Firefox 44+
- Safari 16.4+
- Edge 17+
- Opera 37+

## 🐛 Troubleshooting

### Service Worker Not Registering

Check your `vite.config.ts` or build configuration to ensure service workers are copied to the dist folder:

```typescript
// vite.config.ts
export default {
  publicDir: 'public', // Ensure this is set
}
```

### Notifications Not Appearing

1. Check browser console for errors
2. Verify VAPID key is correct
3. Ensure service worker is registered
4. Check notification permissions in browser settings
5. Verify Firebase project settings are correct

### Token Not Generating

1. Ensure you're using HTTPS (required for service workers)
2. Check if browser supports notifications
3. Verify Firebase configuration is correct
4. Check browser console for specific errors

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🎉 Next Steps

1. Get your VAPID key from Firebase Console
2. Update the VAPID key in the code
3. Add NotificationPrompt to your App
4. Create API endpoint to save FCM tokens
5. Test notifications using Firebase Console
6. Implement notification sending in your booking flow

---

For questions or issues, refer to the Firebase documentation or check the browser console for errors.
