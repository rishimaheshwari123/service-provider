# Reward System - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Run Migration (Setup Initial Data)
```bash
cd server
node migrations/setupRewardSystem.js
```

This will:
- Create default reward settings
- Generate referral codes for existing users
- Initialize reward points for all users

---

### Step 2: Start Your Server
```bash
cd server
npm start
```

---

### Step 3: Test the APIs

#### **A. Setup Reward Settings (Admin)**
```bash
curl -X PUT http://localhost:8000/api/v1/reward/admin/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referralPoints": 100,
    "referralDiscountType": "flat",
    "downloadPoints": 50,
    "downloadDiscountType": "flat",
    "isActive": true
  }'
```

#### **B. Register User with Referral**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "phone": "9876543210",
    "password": "password123",
    "referralCode": "ABC123XYZ"
  }'
```

#### **C. Check User Points**
```bash
curl -X GET http://localhost:8000/api/v1/reward/user/points \
  -H "Authorization: Bearer USER_TOKEN"
```

#### **D. Generate Redeem Code**
```bash
curl -X POST http://localhost:8000/api/v1/reward/user/generate-code \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points": 50}'
```

#### **E. Vendor Apply Code**
```bash
curl -X POST http://localhost:8000/api/v1/reward/vendor/apply-code \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "A3F7B2E1"}'
```

---

## 📱 Mobile App Integration

### App Download Reward
When user downloads app from Play Store, call:

```javascript
POST /api/v1/reward/user/download-reward
{
  "email": "user@example.com"
}
```

**Note:** This is a public endpoint (no authentication required)

---

## 🎯 Common Use Cases

### 1. User Refers a Friend
```
User A shares referral code: ABC123
User B registers with code: ABC123
Result: Both get 100 points (configurable)
```

### 2. User Downloads App
```
User downloads app from Play Store
App sends email to backend
Backend credits 50 points (configurable)
```

### 3. User Redeems Points
```
User generates code with 50 points
Code: A3F7B2E1 (valid for 30 minutes)
User shares code with vendor
Vendor applies code
User's wallet: -50 points
Vendor gets discount info
```

---

## 🔧 Configuration

### Admin Settings
- **Referral Points**: How many points for referrals
- **Download Points**: How many points for app download
- **Discount Type**: "percentage" or "flat"
- **Active Status**: Enable/disable system

### Vendor Settings (Per Vendor)
- **Accepts Rewards**: true/false
- **Discount Type**: "percentage" or "flat"
- **Max Discount**: Optional limit
- **Min Order Value**: Minimum to use rewards

---

## 📊 Admin Dashboard Endpoints

### View Statistics
```bash
GET /api/v1/reward/admin/statistics
```

Returns:
- Total users
- Users with points
- Total points issued
- Total points redeemed
- Total referrals
- Total redemptions

### View All Redemptions
```bash
GET /api/v1/reward/admin/applications?page=1&limit=10&status=used
```

### Configure Vendor
```bash
PUT /api/v1/reward/admin/vendor-settings/:vendorId
{
  "acceptsRewardPoints": true,
  "discountType": "flat",
  "maxDiscountAmount": 500,
  "minOrderValue": 100
}
```

---

## 🐛 Troubleshooting

### Issue: "Referral code not found"
**Solution:** Make sure the referral code exists and is correct (case-insensitive)

### Issue: "Insufficient reward points"
**Solution:** User doesn't have enough points. Check with `/user/points` endpoint

### Issue: "Redeem code expired"
**Solution:** Codes expire after 30 minutes. Generate a new one

### Issue: "Vendor does not accept reward points"
**Solution:** Admin needs to enable rewards for that vendor

### Issue: "Download reward already claimed"
**Solution:** Each user can only claim download reward once

---

## 📝 Important Notes

1. **Redeem codes expire in 30 minutes** - Generate fresh codes when needed
2. **One-time use** - Each code can only be used once
3. **Both users get points** - Referrer and referred both benefit
4. **Admin control** - Admin must enable vendors to accept rewards
5. **Points = Money** - 1 point = ₹1 (flat) or 1% (percentage)

---

## 🎨 Frontend Integration Checklist

### User Dashboard
- [ ] Display total points widget
- [ ] Show available vs used points
- [ ] Display referral code prominently
- [ ] Show referral count
- [ ] List referred users
- [ ] Show reward history table
- [ ] Add "Generate Code" button
- [ ] Display active/expired codes
- [ ] Show code expiry countdown

### Vendor Dashboard
- [ ] Add "Apply Code" input form
- [ ] Show applied codes history
- [ ] Display reward acceptance status
- [ ] Show discount calculation

### Admin Dashboard
- [ ] Reward settings form
- [ ] Vendor settings table
- [ ] Redemptions list with filters
- [ ] Statistics dashboard
- [ ] Search functionality

---

## 🔗 API Documentation

Full API documentation: `REWARD_POINTS_SYSTEM_IMPLEMENTATION.md`

---

## ✅ Quick Test Checklist

- [ ] Run migration script
- [ ] Admin can update settings
- [ ] User registration with referral works
- [ ] Both users receive points
- [ ] Download reward works
- [ ] User can view points
- [ ] User can generate code
- [ ] Vendor can apply code
- [ ] Points deducted correctly
- [ ] Admin can view stats

---

## 🎉 You're Ready!

The reward system is fully functional. Start integrating with your frontend!

**Need Help?** Check the detailed documentation in `REWARD_POINTS_SYSTEM_IMPLEMENTATION.md`
