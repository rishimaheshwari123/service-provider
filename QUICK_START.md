# 🚀 Firebase Notifications - Quick Start

## ⚡ 3 Steps to Get Started

### 1️⃣ Get VAPID Key (2 minutes)

1. Go to https://console.firebase.google.com/
2. Open project: **mgsa-a4899**
3. Settings ⚙️ > Cloud Messaging > Web Push certificates
4. Copy your key (or Generate if needed)

### 2️⃣ Update Code (1 minute)

Open `src/hooks/useNotification.ts` and paste your key:

```typescript
const VAPID_KEY = 'YOUR_KEY_HERE'; // ← Paste your key here
```

### 3️⃣ Test (30 seconds)

1. Start app: `npm run dev`
2. Click "Enable Notifications" button
3. Check console for FCM token ✓

---

## 🎯 Already Done For You

✅ Firebase installed and configured  
✅ Service worker created  
✅ Backend APIs ready  
✅ Database fields added  
✅ Notification prompt added to App  
✅ Helper functions created  

## 📝 Send Your First Notification

### From Firebase Console (Testing)

1. Firebase Console > Cloud Messaging
2. "Send your first message"
3. Add title & text
4. "Send test message" → Paste FCM token
5. Click "Test" 🎉

### From Your Code (Production)

```javascript
// In any controller
const { sendBookingConfirmation } = require('../utils/notificationHelper');

// Send notification
await sendBookingConfirmation(userId, {
  _id: booking._id,
  serviceName: booking.serviceName
});
```

---

## 📚 Available Notification Functions

All in `server/utils/notificationHelper.js`:

- `sendBookingConfirmation()` - Booking confirmed
- `sendBookingCancellation()` - Booking cancelled  
- `sendBookingReminder()` - Upcoming booking
- `sendVendorAssignment()` - New job for vendor
- `sendPaymentSuccess()` - Payment completed
- `sendWelcomeNotification()` - Welcome new user
- `sendReviewRequest()` - Request review
- `sendPromotionalNotification()` - Marketing

---

## 🔧 Integration Examples

### Booking Created
```javascript
const { sendBookingConfirmation, sendVendorAssignment } = require('../utils/notificationHelper');

// After booking creation
await sendBookingConfirmation(userId, bookingData);
if (vendorId) {
  await sendVendorAssignment(vendorId, bookingData);
}
```

### Payment Success
```javascript
const { sendPaymentSuccess } = require('../utils/notificationHelper');

// After payment verified
await sendPaymentSuccess(userId, paymentData);
```

### New User Welcome
```javascript
const { sendWelcomeNotification } = require('../utils/notificationHelper');

// After user registration
sendWelcomeNotification(newUser._id, newUser.name).catch(console.error);
```

---

## 🐛 Troubleshooting

**No token generated?**
→ Check VAPID key is correct

**Service worker error?**
→ Ensure using HTTPS or localhost

**Notification not received?**
→ Check user has fcmToken in database

---

## 📖 More Help

- **Full Setup Guide:** `FIREBASE_NOTIFICATION_SETUP.md`
- **Code Examples:** `NOTIFICATION_USAGE_EXAMPLE.md`
- **Complete Summary:** `NOTIFICATION_SETUP_SUMMARY.md`

---

## ✨ That's It!

Three steps and you're ready to send push notifications! 🎉

**Questions?** Check the detailed guides above or Firebase docs.
