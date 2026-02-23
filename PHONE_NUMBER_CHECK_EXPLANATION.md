# 📱 Phone Number Duplicate Check - How It Works

## 🎯 Overview

The system checks if a phone number is already registered in the database before allowing vendor registration or sending OTP. This prevents duplicate accounts and maintains data integrity.

## 🗄️ Database Collections

### 1. **Auth Collection** (Users)
- **Model**: `authModel`
- **Collection Name**: `auth`
- **Phone Field**: `phone`
- **Purpose**: Stores regular user accounts

### 2. **Vendor Collection** (Service Providers)
- **Model**: `vendorModel`
- **Collection Name**: `vendors`
- **Phone Fields**: 
  - `phone` (Primary contact)
  - `whatsappNumber` (WhatsApp contact)
  - `alternatePhone` (Alternate contact)
- **Purpose**: Stores vendor/service provider accounts

## 🔍 How the Check Works

### Step 1: Determine Number to Verify
```javascript
const numberToVerify = preferredMethod === 'whatsapp' && whatsappNumber 
  ? whatsappNumber 
  : phone;
```
- If user selected WhatsApp → check WhatsApp number
- If user selected SMS → check phone number

### Step 2: Check Vendor Collection
```javascript
const existingVendor = await vendorModel.findOne({ 
  $or: [
    { phone: numberToVerify },
    { whatsappNumber: numberToVerify }
  ]
});
```
**Checks:**
- ✅ `phone` field matches the number
- ✅ `whatsappNumber` field matches the number

### Step 3: Check Auth (User) Collection
```javascript
const authModel = require('../models/authModel');
const existingUser = await authModel.findOne({ phone: numberToVerify });
```
**Checks:**
- ✅ `phone` field matches the number

### Step 4: Block if Found in Auth Collection
```javascript
if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "This phone number is already registered as a user. Please use a different number or login."
  });
}
```

### Step 5: Block if Fully Registered Vendor
```javascript
if (existingVendor && existingVendor.isPhoneVerified && existingVendor.name && !forceResend) {
  return res.status(400).json({
    success: false,
    message: "This phone number is already registered as a vendor. Please use a different number or login."
  });
}
```

## 📊 Check Flow Diagram

```
User enters phone: 9009594537
        ↓
Determine number to verify
        ↓
┌─────────────────────────────────┐
│ Check Vendor Collection         │
│ Query: { $or: [                 │
│   { phone: "9009594537" },      │
│   { whatsappNumber: "9009594537"}│
│ ]}                              │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Check Auth Collection           │
│ Query: { phone: "9009594537" }  │
└─────────────────────────────────┘
        ↓
    Found in Auth?
        ↓ Yes
❌ Error: "Already registered as user"
        ↓ No
    Found in Vendor?
        ↓ Yes
    Fully Registered?
        ↓ Yes
❌ Error: "Already registered as vendor"
        ↓ No
    ✅ Send OTP
```

## 🔍 What Gets Checked in Each Collection

### Auth Collection Check:
```javascript
// Checks this field:
{
  phone: "9009594537"  // ← Checks this
}
```

### Vendor Collection Check:
```javascript
// Checks these fields:
{
  phone: "9009594537",          // ← Checks this
  whatsappNumber: "9009594537", // ← Checks this
  alternatePhone: "1234567890"  // ✗ Does NOT check this
}
```

**Note**: `alternatePhone` is NOT checked because it's meant to be a secondary contact, not for login/registration.

## 📱 Example Scenarios

### Scenario 1: Number Registered as User
```
Database State:
- Auth Collection: { phone: "9009594537", name: "John" }
- Vendor Collection: (empty)

User Action:
- Tries to register as vendor with phone: 9009594537

Result:
❌ Error: "This phone number is already registered as a user. 
          Please use a different number or login."
```

### Scenario 2: Number Registered as Vendor
```
Database State:
- Auth Collection: (empty)
- Vendor Collection: { 
    phone: "9009594537", 
    name: "ABC Company",
    isPhoneVerified: true 
  }

User Action:
- Tries to register as vendor with phone: 9009594537

Result:
❌ Error: "This phone number is already registered as a vendor. 
          Please use a different number or login."
```

### Scenario 3: Number Not Registered
```
Database State:
- Auth Collection: (empty)
- Vendor Collection: (empty)

User Action:
- Tries to register as vendor with phone: 9009594537

Result:
✅ Success: OTP sent to 9009594537
```

### Scenario 4: Incomplete Vendor Registration
```
Database State:
- Auth Collection: (empty)
- Vendor Collection: { 
    phone: "9009594537", 
    name: null,  // ← No name yet
    isPhoneVerified: false 
  }

User Action:
- Tries to register as vendor with phone: 9009594537

Result:
✅ Success: OTP sent (allows completion of registration)
```

## 🔒 Why This Check is Important

1. **Prevents Duplicate Accounts**: One phone number can't be used for both user and vendor accounts
2. **Data Integrity**: Ensures clean database without conflicts
3. **Security**: Prevents account hijacking or confusion
4. **User Experience**: Clear error messages guide users
5. **Business Logic**: Maintains separation between user and vendor roles

## 🧪 How to Verify in Database

### Check if Number Exists in Auth Collection:
```javascript
// MongoDB Query
db.auth.findOne({ phone: "9009594537" })

// If returns a document → Number is registered as user
// If returns null → Number is not registered as user
```

### Check if Number Exists in Vendor Collection:
```javascript
// MongoDB Query
db.vendors.findOne({ 
  $or: [
    { phone: "9009594537" },
    { whatsappNumber: "9009594537" }
  ]
})

// If returns a document → Number is registered as vendor
// If returns null → Number is not registered as vendor
```

## 📋 Fields Checked Summary

| Collection | Fields Checked | Purpose |
|------------|---------------|---------|
| Auth (Users) | `phone` | Primary login number |
| Vendors | `phone`, `whatsappNumber` | Primary and WhatsApp numbers |

**Not Checked:**
- `alternatePhone` in Vendor collection (secondary contact only)

## 🎯 Your Specific Case

Based on the screenshot showing phone number `9009594537`:

**Error Message**: "This phone number is already registered as a user. Please use a different number or login."

**This means:**
1. ✅ The number `9009594537` exists in the **Auth (users) collection**
2. ✅ The check is working correctly
3. ✅ The user needs to either:
   - Use a different phone number for vendor registration
   - Login as a user with this number

**To verify in database:**
```javascript
// Check Auth collection
db.auth.findOne({ phone: "9009594537" })
// This will return a user document if it exists
```

## 🔧 How to Fix

If you want to allow this number for vendor registration, you need to:

1. **Option 1**: Delete the user account with this phone number
   ```javascript
   db.auth.deleteOne({ phone: "9009594537" })
   ```

2. **Option 2**: Use a different phone number for vendor registration

3. **Option 3**: Modify the business logic to allow same number for both (not recommended)

The current implementation is correct and working as designed to prevent duplicate phone numbers across user and vendor accounts! 🎉