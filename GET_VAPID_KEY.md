# 🔑 VAPID Key Kaise Le - Step by Step

## Ye Zaruri Hai! Bina Is Key Ke Notifications Kaam Nahi Karenge

### Steps:

1. **Firebase Console Kholo**
   - Link: https://console.firebase.google.com/
   - Login karo

2. **Apna Project Select Karo**
   - Project name: **mgsa-a4899**
   - Click karo project pe

3. **Settings Mein Jao**
   - Top-left mein gear icon (⚙️) pe click karo
   - "Project settings" select karo

4. **Cloud Messaging Tab**
   - Settings page mein "Cloud Messaging" tab pe click karo

5. **Web Push certificates Section**
   - Neeche scroll karo
   - "Web Push certificates" section dhundo

6. **Generate Key (Agar Nahi Hai)**
   - Agar key pair nahi hai, toh "Generate key pair" button pe click karo
   - Key automatically generate ho jayegi

7. **Copy Karo**
   - Key pair ko copy karo
   - Ye "B..." se start hoga (bahut lamba hoga, 88 characters)

### Example Kaise Dikhega:
```
BHt-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Ab Code Mein Paste Karo:

### File: `src/hooks/useNotification.ts`

Line 7 pe ye hai:
```typescript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

Isko replace karo apne key se:
```typescript
const VAPID_KEY = 'BHt-xxxxx...'; // Apna actual key yaha paste karo
```

## ✅ Check Karo

1. File save karo
2. App refresh karo
3. 3 seconds wait karo
4. Browser permission dialog aana chahiye: "Allow notifications?"
5. "Allow" pe click karo
6. Console mein "FCM Token obtained:" dikhna chahiye

## 🐛 Agar Problem Aaye

**Permission dialog nahi aa raha?**
- Check karo browser console for errors
- VAPID key sahi paste kiya hai?
- HTTPS ya localhost pe chal raha hai?

**Token generate nahi ho raha?**
- VAPID key verify karo
- Firebase project ID match kar raha hai?
- Browser notifications support karta hai? (Chrome/Firefox/Edge)

---

**Important:** Ye key public hai, commit kar sakte ho. Service account key (JSON file) ko commit mat karna!
