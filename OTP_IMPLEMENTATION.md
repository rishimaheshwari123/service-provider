# OTP Verification Implementation for Vendor Registration

## Overview
This implementation adds OTP (One-Time Password) verification to the vendor registration process. The system intelligently chooses which number to verify based on user's WhatsApp preference:

- **If user has WhatsApp**: Verify WhatsApp number via WhatsApp OTP
- **If user doesn't have WhatsApp**: Verify phone number via SMS OTP

## Features
- **Smart Number Verification**: Verifies the appropriate number based on WhatsApp availability
- **Dual OTP Methods**: SMS and WhatsApp OTP support with SMS fallback
- **Phone Number Verification**: Mandatory number verification before registration
- **6-digit OTP**: Secure 6-digit OTP with 10-minute expiry
- **User-friendly UI**: Inline verification in Step 2 of registration

## Verification Logic

### WhatsApp = Yes
- User enters both phone number and WhatsApp number
- **Verify button appears next to WhatsApp number field**
- OTP is sent to WhatsApp number via WhatsApp API
- If WhatsApp API fails, automatically falls back to SMS
- WhatsApp number gets verified and marked as ✓ Verified

### WhatsApp = No  
- User enters only phone number
- **Verify button appears separately for phone number**
- OTP is sent to phone number via SMS
- Phone number gets verified and marked as ✓ Verified

## API Endpoints

### 1. Send OTP
**POST** `/api/v1/vendor/send-otp`

**Request Body for WhatsApp:**
```json
{
  "phone": "9876543210",
  "whatsappNumber": "9876543210",
  "preferredMethod": "whatsapp"
}
```

**Request Body for SMS:**
```json
{
  "phone": "9876543210",
  "preferredMethod": "sms"
}
```

### 2. Verify OTP
**POST** `/api/v1/vendor/verify-otp`

**Request Body:**
```json
{
  "phone": "9876543210", // The number that was verified (WhatsApp or phone)
  "otp": "123456"
}
```

## Database Changes

### Vendor Model Updates
```javascript
// OTP Verification Fields
otp: { type: String },
otpExpiry: { type: Date },
isPhoneVerified: { type: Boolean, default: false },
isWhatsappVerified: { type: Boolean, default: false },
preferredOtpMethod: { type: String, enum: ["whatsapp", "sms"] },
```

## SMS & WhatsApp Configuration
- **SMS API**: `http://182.18.162.128/api/mt/SendSMS` ✅ Working
- **WhatsApp API**: `http://rcsmeta.msg24.in/api/v1/meta/messages` with SMS fallback ✅ Working
- **Template**: `loginotp1` for WhatsApp
- **Token**: `600938a3-d522-4334-884d-ffe875e8986b`

## Frontend UI Flow

### Step 2: Contact Details
1. User enters phone number (required)
2. User selects "Do you have WhatsApp?" (Yes/No)
3. **If Yes**: WhatsApp number field appears with verify button
4. **If No**: Separate verify button appears for phone number
5. User clicks verify → OTP sent to appropriate number
6. User enters OTP in inline form → Number gets verified ✓
7. Verified number shows green background and checkmark

## Security Features
- **Smart Verification**: Only verifies the number that will be used for communication
- **OTP Expiry**: 10 minutes
- **Fallback System**: WhatsApp failures automatically use SMS
- **Number Validation**: 10-digit Indian mobile numbers
- **Secure Storage**: OTP cleared after verification

## Testing Results
- ✅ SMS OTP: Working perfectly
- ✅ WhatsApp OTP: Working with SMS fallback
- ✅ Frontend Integration: Complete
- ✅ Backend Logic: Implemented
- ✅ Database Updates: Applied

## Usage Instructions
1. User goes to vendor registration
2. Fills Step 1 (Basic Info)
3. In Step 2, enters contact details
4. Chooses WhatsApp preference
5. Clicks verify button next to appropriate field
6. Receives and enters OTP
7. Continues with registration after verification

The system now intelligently handles both WhatsApp and SMS verification based on user preference!