# Reward Points System - Complete Implementation Guide

## Overview
A comprehensive reward points system that allows users to earn points through referrals and app downloads, and redeem them with vendors.

---

## Features Implemented

### 1. **Reward Points Earning**
- ✅ **Referral Rewards**: Both referrer and referred user get points
- ✅ **App Download Rewards**: Users get points when downloading from Play Store

### 2. **Admin Controls**
- ✅ Set referral points amount
- ✅ Set download points amount
- ✅ Choose discount type (Percentage or Flat)
- ✅ Configure vendor-wise reward acceptance
- ✅ View all reward applications/redemptions
- ✅ View reward statistics

### 3. **User Features**
- ✅ View total reward points
- ✅ View reward history (where points came from)
- ✅ View referral count and referred users
- ✅ Generate redeem codes (30-minute validity)
- ✅ One-time use codes
- ✅ Unique referral code for each user

### 4. **Vendor Features**
- ✅ Apply user redeem codes
- ✅ View applied codes history
- ✅ Check if vendor accepts reward points
- ✅ Admin can configure vendor settings

---

## Database Models Created

### 1. **RewardSettings Model** (`server/models/rewardSettingsModel.js`)
Stores global reward configuration:
- `referralPoints`: Points for referrals
- `referralDiscountType`: "percentage" or "flat"
- `downloadPoints`: Points for app downloads
- `downloadDiscountType`: "percentage" or "flat"
- `isActive`: Enable/disable reward system

### 2. **RewardPoints Model** (`server/models/rewardPointsModel.js`)
Tracks user points:
- `userId`: Reference to user
- `totalPoints`: Total points earned
- `availablePoints`: Points available to use
- `usedPoints`: Points already redeemed
- `referralCount`: Number of successful referrals
- `referredUsers`: Array of referred users with details

### 3. **RewardHistory Model** (`server/models/rewardHistoryModel.js`)
Transaction history:
- `userId`: User who earned/spent points
- `points`: Amount of points
- `type`: "credit" or "debit"
- `source`: "referral", "download", or "redemption"
- `description`: Human-readable description
- `balanceAfter`: Balance after transaction

### 4. **RedeemCode Model** (`server/models/redeemCodeModel.js`)
Generated redeem codes:
- `code`: Unique 8-character code
- `userId`: User who generated it
- `points`: Points being redeemed
- `discountAmount`: Calculated discount
- `status`: "active", "used", or "expired"
- `expiresAt`: 30 minutes from generation
- `appliedBy`: Vendor who applied the code

### 5. **VendorRewardSettings Model** (`server/models/vendorRewardSettingsModel.js`)
Vendor-specific settings:
- `vendorId`: Reference to vendor
- `acceptsRewardPoints`: Boolean
- `discountType`: "percentage" or "flat"
- `maxDiscountAmount`: Optional limit
- `minOrderValue`: Minimum order to use points

### 6. **Updated Auth Model** (`server/models/authModel.js`)
Added referral fields:
- `referralCode`: Unique code for user
- `referredBy`: User who referred them
- `referredByCode`: Code used during registration

---

## API Endpoints

### **Admin Endpoints**

#### 1. Get Reward Settings
```
GET /api/v1/reward/admin/settings
Headers: Authorization: Bearer <admin_token>
```

#### 2. Update Reward Settings
```
PUT /api/v1/reward/admin/settings
Headers: Authorization: Bearer <admin_token>
Body: {
  "referralPoints": 100,
  "referralDiscountType": "flat",
  "downloadPoints": 50,
  "downloadDiscountType": "percentage",
  "isActive": true
}
```

#### 3. Get All Vendor Reward Settings
```
GET /api/v1/reward/admin/vendor-settings?page=1&limit=10&search=vendor_name
Headers: Authorization: Bearer <admin_token>
```

#### 4. Update Vendor Reward Settings
```
PUT /api/v1/reward/admin/vendor-settings/:vendorId
Headers: Authorization: Bearer <admin_token>
Body: {
  "acceptsRewardPoints": true,
  "discountType": "flat",
  "maxDiscountAmount": 500,
  "minOrderValue": 100,
  "isActive": true
}
```

#### 5. Get All Reward Applications
```
GET /api/v1/reward/admin/applications?page=1&limit=10&status=used&search=CODE123
Headers: Authorization: Bearer <admin_token>
```

#### 6. Get Reward Statistics
```
GET /api/v1/reward/admin/statistics
Headers: Authorization: Bearer <admin_token>

Response: {
  "totalUsers": 1000,
  "usersWithPoints": 450,
  "totalPointsIssued": 50000,
  "totalPointsRedeemed": 15000,
  "totalReferrals": 300,
  "totalRedemptions": 120,
  "activeRedeemCodes": 25
}
```

---

### **User Endpoints**

#### 1. Get User Reward Points
```
GET /api/v1/reward/user/points
Headers: Authorization: Bearer <user_token>

Response: {
  "totalPoints": 500,
  "availablePoints": 350,
  "usedPoints": 150,
  "referralCount": 5,
  "referredUsers": [...]
}
```

#### 2. Get User Reward History
```
GET /api/v1/reward/user/history?page=1&limit=20&type=credit&source=referral
Headers: Authorization: Bearer <user_token>
```

#### 3. Generate Redeem Code
```
POST /api/v1/reward/user/generate-code
Headers: Authorization: Bearer <user_token>
Body: {
  "points": 100
}

Response: {
  "code": "A3F7B2E1",
  "points": 100,
  "discountAmount": 100,
  "expiresAt": "2026-04-27T15:30:00.000Z",
  "status": "active"
}
```

#### 4. Get User Redeem Codes
```
GET /api/v1/reward/user/redeem-codes?status=active
Headers: Authorization: Bearer <user_token>
```

#### 5. App Download Reward (Public - Called by Mobile App)
```
POST /api/v1/reward/user/download-reward
Body: {
  "email": "user@example.com"
}

Response: {
  "pointsEarned": 50,
  "totalPoints": 50,
  "availablePoints": 50
}
```

---

### **Vendor Endpoints**

#### 1. Apply Redeem Code
```
POST /api/v1/reward/vendor/apply-code
Headers: Authorization: Bearer <vendor_token>
Body: {
  "code": "A3F7B2E1"
}

Response: {
  "code": "A3F7B2E1",
  "discountAmount": 100,
  "discountType": "flat",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

#### 2. Get Vendor Applied Codes History
```
GET /api/v1/reward/vendor/applied-codes?page=1&limit=20
Headers: Authorization: Bearer <vendor_token>
```

#### 3. Check Vendor Reward Settings
```
GET /api/v1/reward/vendor/settings
Headers: Authorization: Bearer <vendor_token>

Response: {
  "acceptsRewardPoints": true,
  "discountType": "flat",
  "maxDiscountAmount": 500,
  "isActive": true
}
```

---

## How It Works

### **Referral Flow**

1. **User Registration with Referral Code**:
   ```javascript
   POST /api/v1/auth/register
   {
     "name": "New User",
     "email": "newuser@example.com",
     "phone": "9876543210",
     "password": "password123",
     "referralCode": "ABC123XYZ" // Optional
   }
   ```

2. **System automatically**:
   - Validates referral code
   - Creates new user with unique referral code
   - Awards points to both referrer and new user
   - Creates reward history entries

### **Download Reward Flow**

1. **Mobile app calls after download**:
   ```javascript
   POST /api/v1/reward/user/download-reward
   {
     "email": "user@example.com"
   }
   ```

2. **System checks**:
   - User exists
   - Download reward not already claimed
   - Reward settings are active
   - Awards points and creates history

### **Redemption Flow**

1. **User generates code**:
   ```javascript
   POST /api/v1/reward/user/generate-code
   {
     "points": 100
   }
   ```
   - System validates sufficient points
   - Generates unique 8-character code
   - Sets 30-minute expiry
   - Returns code to user

2. **User shares code with vendor**

3. **Vendor applies code**:
   ```javascript
   POST /api/v1/reward/vendor/apply-code
   {
     "code": "A3F7B2E1"
   }
   ```
   - System validates code (exists, not used, not expired)
   - Checks vendor accepts rewards
   - Marks code as used
   - Deducts points from user
   - Creates history entry
   - Returns discount details

---

## Utility Functions

### **rewardHelper.js** (`server/utils/rewardHelper.js`)

#### 1. `generateReferralCode(userId)`
Generates unique 8-character referral code for users.

#### 2. `processReferralReward(referrerId, newUserId)`
Processes referral rewards for both users:
- Awards points to referrer
- Awards points to new user
- Updates referral count
- Creates history entries

#### 3. `expireOldRedeemCodes()`
Expires redeem codes past 30 minutes (can be run via cron job).

---

## Authentication Middleware

### **verifyToken.js** (`server/utils/verifyToken.js`)

#### 1. `verifyToken`
Validates JWT token from headers/cookies.

#### 2. `isAdmin`
Checks if user has admin role.

#### 3. `isVendor`
Checks if user is a vendor.

#### 4. `isUser`
Checks if user is a regular user.

---

## Admin Sidebar Pages (Frontend - To Be Implemented)

### 1. **Rewards Settings Page**
Path: `/admin/rewards/settings`

Features:
- Set referral points
- Set download points
- Choose discount type (% or flat)
- Toggle reward system on/off

### 2. **Reward Applications Page**
Path: `/admin/rewards/applications`

Features:
- View all redemptions
- Filter by status (active/used/expired)
- Search by code
- View user and vendor details
- Export data

### 3. **Vendor Reward Settings Page**
Path: `/admin/rewards/vendor-settings`

Features:
- List all vendors
- Enable/disable reward acceptance per vendor
- Set discount type per vendor
- Set max discount and min order value

---

## Testing the APIs

### 1. **Setup Reward Settings (Admin)**
```bash
curl -X PUT http://localhost:8000/api/v1/reward/admin/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "referralPoints": 100,
    "referralDiscountType": "flat",
    "downloadPoints": 50,
    "downloadDiscountType": "flat",
    "isActive": true
  }'
```

### 2. **Register User with Referral**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "referralCode": "ABC123XYZ"
  }'
```

### 3. **Check User Points**
```bash
curl -X GET http://localhost:8000/api/v1/reward/user/points \
  -H "Authorization: Bearer <user_token>"
```

### 4. **Generate Redeem Code**
```bash
curl -X POST http://localhost:8000/api/v1/reward/user/generate-code \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 50
  }'
```

### 5. **Vendor Apply Code**
```bash
curl -X POST http://localhost:8000/api/v1/reward/vendor/apply-code \
  -H "Authorization: Bearer <vendor_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "A3F7B2E1"
  }'
```

---

## Environment Variables Required

Make sure these are in your `.env` file:
```env
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
PORT=8000
```

---

## Next Steps (Frontend Implementation)

### Admin Dashboard:
1. Create Rewards Settings page
2. Create Reward Applications page
3. Create Vendor Reward Settings page
4. Add sidebar menu items

### User Dashboard:
1. Display reward points widget
2. Show reward history
3. Show referral count and referred users
4. Add "Generate Redeem Code" button
5. Display active/expired codes

### Vendor Dashboard:
1. Add "Apply Redeem Code" form
2. Show applied codes history
3. Display reward acceptance status

---

## Important Notes

1. **Code Expiry**: Redeem codes expire after 30 minutes
2. **One-time Use**: Each code can only be used once
3. **Vendor Settings**: Admin must enable reward acceptance for each vendor
4. **Referral Rewards**: Both referrer and referred user get equal points
5. **Download Rewards**: Can only be claimed once per user
6. **Points Calculation**: Points directly translate to discount (1 point = ₹1 for flat, 1 point = 1% for percentage)

---

## Files Created/Modified

### New Files:
- `server/models/rewardSettingsModel.js`
- `server/models/rewardPointsModel.js`
- `server/models/rewardHistoryModel.js`
- `server/models/redeemCodeModel.js`
- `server/models/vendorRewardSettingsModel.js`
- `server/controllers/rewardCtrl.js`
- `server/routes/rewardRoute.js`
- `server/utils/rewardHelper.js`
- `server/utils/verifyToken.js`

### Modified Files:
- `server/models/authModel.js` (added referral fields)
- `server/controllers/authCtrl.js` (added referral logic in registration)
- `server/index.js` (added reward route)

---

## Success! 🎉

The complete reward points system backend is now implemented and ready to use. All APIs are functional and can be tested immediately.
