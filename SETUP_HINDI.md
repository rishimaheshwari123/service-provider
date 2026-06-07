# 🔔 Firebase Notifications Setup - Hindi Guide

## ✅ Jo Kaam Ho Gaya Hai

1. ✅ Firebase package install ho gaya
2. ✅ Firebase configuration file ban gaya (`src/lib/firebase.ts`)
3. ✅ Service worker ban gaya (`public/firebase-messaging-sw.js`)
4. ✅ Backend mein APIs ready hain
5. ✅ Database model update ho gaya (fcmToken field add hua)
6. ✅ Notification permission automatically puchne wala component ban gaya
7. ✅ App.tsx mein sab add ho gaya

## 🔧 Bas Ek Kaam Baaki Hai - VAPID Key

### Step 1: VAPID Key Lo (2 minute)

1. Firebase Console kholo: https://console.firebase.google.com/
2. Project select karo: **mgsa-a4899**
3. Settings (⚙️) > Project settings > Cloud Messaging
4. "Web Push certificates" section mein
5. "Generate key pair" pe click (agar pehle se nahi hai)
6. Key copy karo (B... se start hoga)

**Detail guide:** `GET_VAPID_KEY.md` dekho

### Step 2: Key Code Mein Paste Karo

File kholo: `src/hooks/useNotification.ts`

Line 7 pe:
```typescript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

Replace karo apne key se:
```typescript
const VAPID_KEY = 'BHt-xxxxxxxxxxxxx...'; // Apna key yaha
```

### Step 3: Test Karo

1. App start karo: `npm run dev`
2. Browser mein kholo
3. Login karo (notifications logged-in users ko hi milte hain)
4. 3 seconds wait karo
5. Browser permission dialog aayega: "Allow notifications?"
6. "Allow" pe click karo ✅

## 🎉 Kaise Kaam Karega

### User Experience:

1. **User app kholta hai**
2. **Login karta hai**
3. **3 seconds baad** → Browser automatically permission puuchta hai
4. **User "Allow" karta hai** → FCM token automatically backend mein save ho jata hai
5. **Ab notifications aa sakti hain!** 🎉

### Notifications Kab Aayengi:

- Booking confirm hone pe
- Payment success hone pe
- Vendor assign hone pe
- Booking reminder
- Welcome message (naye users ko)
- Promotional offers

## 📱 Features

### 1. Automatic Permission Request
- App start hote hi (3 seconds baad)
- Sirf logged-in users ko
- Browser ka native dialog dikhta hai

### 2. Notification Prompt (Agar User Block Kare)
- Beautiful UI prompt
- Bottom-right corner mein dikhta hai
- User dismiss kar sakta hai

### 3. Foreground Notifications
- Jab app khula ho
- Toast notification dikhta hai
- Click karke relevant page pe ja sakte hain

### 4. Background Notifications
- Jab app close ho ya tab background mein ho
- Browser notification dikhta hai
- Click karne pe app khulta hai

## 🔧 Backend Mein Kaise Use Kare

### Example 1: Booking Confirm Pe

```javascript
// bookingCtrl.js mein
const { sendBookingConfirmation } = require('../utils/notificationHelper');

// Booking create karne ke baad
await sendBookingConfirmation(userId, {
  _id: booking._id,
  serviceName: booking.serviceName
});
```

### Example 2: Payment Success Pe

```javascript
// paymentCtrl.js mein
const { sendPaymentSuccess } = require('../utils/notificationHelper');

// Payment verify hone ke baad
await sendPaymentSuccess(userId, {
  _id: payment._id,
  amount: payment.amount
});
```

### Example 3: Welcome Message

```javascript
// authCtrl.js mein registration ke baad
const { sendWelcomeNotification } = require('../utils/notificationHelper');

sendWelcomeNotification(newUser._id, newUser.name).catch(console.error);
```

## 📁 Important Files

### Frontend:
- `src/lib/firebase.ts` - Firebase configuration
- `src/hooks/useNotification.ts` - **VAPID key yaha paste karo**
- `src/components/NotificationSetup.tsx` - Auto permission request
- `src/components/NotificationPrompt.tsx` - Manual prompt UI
- `public/firebase-messaging-sw.js` - Service worker

### Backend:
- `server/models/authModel.js` - fcmToken field
- `server/controllers/authCtrl.js` - Token management APIs
- `server/routes/authRoute.js` - Routes
- `server/utils/notificationHelper.js` - **Notification bhejne ke functions**

## 🐛 Common Problems

### Permission Dialog Nahi Aa Raha?

**Check karo:**
- VAPID key paste kiya?
- User logged in hai?
- Browser console mein errors?
- HTTPS ya localhost pe running hai?

### Notification Nahi Aa Rahi?

**Check karo:**
- Permission "Allow" kiya?
- User ke paas fcmToken hai database mein?
- Backend se notification bhej rahe ho?
- Browser console mein errors?

### Service Worker Error?

**Solution:**
- Browser cache clear karo
- Hard refresh karo (Ctrl + Shift + R)
- Service worker unregister karo aur phir se try karo

## 📊 Database

User model mein automatically ye fields add ho gaye:

```javascript
fcmToken: String  // Firebase Cloud Messaging token
notificationPreferences: {
  bookingUpdates: Boolean,
  promotions: Boolean,
  reminders: Boolean,
  general: Boolean
}
```

## 🎯 Available Notification Functions

Sab `server/utils/notificationHelper.js` mein hain:

1. `sendBookingConfirmation()` - Booking confirm
2. `sendBookingCancellation()` - Booking cancel
3. `sendBookingReminder()` - Booking reminder
4. `sendVendorAssignment()` - Vendor ko new job
5. `sendPaymentSuccess()` - Payment success
6. `sendWelcomeNotification()` - Welcome message
7. `sendReviewRequest()` - Review request
8. `sendPromotionalNotification()` - Promotional offers
9. `sendNotificationToUser()` - Custom notification (single user)
10. `sendNotificationToMultipleUsers()` - Custom notification (multiple users)

## 🚀 Next Steps

1. ✅ VAPID key lo aur paste karo
2. ✅ App test karo
3. ✅ Permission allow karo
4. ✅ Booking flow mein notifications add karo
5. ✅ Payment flow mein notifications add karo
6. ✅ Test karo Firebase Console se

## 📞 Help

- **Full English Guide:** `FIREBASE_NOTIFICATION_SETUP.md`
- **VAPID Key Guide:** `GET_VAPID_KEY.md`
- **Code Examples:** `NOTIFICATION_USAGE_EXAMPLE.md`
- **Quick Start:** `QUICK_START.md`

---

**Important:** Sirf VAPID key paste karna baaki hai, baaki sab ready hai! 🎉
