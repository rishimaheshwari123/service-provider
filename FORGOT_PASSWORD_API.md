# Forgot Password API Documentation

This document describes the forgot password functionality for both Users and Vendors with phone number-based OTP verification and SMS/WhatsApp options.

## Features

- ✅ Phone number-based password reset
- ✅ SMS and WhatsApp OTP options
- ✅ Secure token-based password reset
- ✅ OTP expiry (10 minutes)
- ✅ Reset token expiry (15 minutes)
- ✅ Separate flows for Users and Vendors

## User Forgot Password Flow

### 1. Request Password Reset OTP

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otpMethod": "sms"  // "sms" or "whatsapp"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset OTP sent via SMS",
  "method": "sms"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "User not found with this phone number"
}
```

### 2. Verify Reset OTP

**Endpoint:** `POST /api/auth/verify-reset-otp`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Vendor Forgot Password Flow

### 1. Request Password Reset OTP

**Endpoint:** `POST /api/vendor/forgot-password`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otpMethod": "whatsapp"  // "sms" or "whatsapp"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset OTP sent via WHATSAPP",
  "method": "whatsapp"
}
```

**Note:** For vendors, if `otpMethod` is "whatsapp" and vendor has a `whatsappNumber` field, it will use that number. Otherwise, it uses the phone number.

### 2. Verify Reset OTP

**Endpoint:** `POST /api/vendor/verify-reset-otp`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Reset Password

**Endpoint:** `POST /api/vendor/reset-password`

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newVendorPassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Missing required fields |
| 404 | Not Found - User/Vendor not found |
| 401 | Unauthorized - Invalid OTP or token |
| 500 | Internal Server Error |

## Common Error Messages

- `"Phone number is required"`
- `"User not found with this phone number"`
- `"Vendor not found with this phone number"`
- `"Phone number and OTP are required"`
- `"No OTP found. Please request a new one."`
- `"OTP has expired. Please request a new one."`
- `"Invalid OTP"`
- `"Invalid or expired reset token"`
- `"Failed to send OTP. Please try again."`

## Security Features

1. **OTP Expiry:** OTPs expire after 10 minutes
2. **Token Expiry:** Reset tokens expire after 15 minutes
3. **One-time Use:** OTPs are cleared after successful verification
4. **Secure Hashing:** Passwords are hashed using bcrypt
5. **JWT Tokens:** Reset tokens are signed JWT tokens with purpose validation

## Database Schema Updates

### Auth Model (Users)
```javascript
// New fields added
resetPasswordOTP: {
    type: String,
},
resetPasswordOTPExpiry: {
    type: Date,
}
```

### Vendor Model
```javascript
// New fields added
resetPasswordOTP: {
    type: String,
},
resetPasswordOTPExpiry: {
    type: Date,
}
```

## Frontend Integration Example

```javascript
// Step 1: Request OTP
const requestOTP = async (phone, otpMethod, userType = 'user') => {
    const endpoint = userType === 'vendor' 
        ? '/api/vendor/forgot-password' 
        : '/api/auth/forgot-password';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otpMethod })
    });
    
    return response.json();
};

// Step 2: Verify OTP
const verifyOTP = async (phone, otp, userType = 'user') => {
    const endpoint = userType === 'vendor' 
        ? '/api/vendor/verify-reset-otp' 
        : '/api/auth/verify-reset-otp';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
    });
    
    return response.json();
};

// Step 3: Reset Password
const resetPassword = async (resetToken, newPassword, userType = 'user') => {
    const endpoint = userType === 'vendor' 
        ? '/api/vendor/reset-password' 
        : '/api/auth/reset-password';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
    });
    
    return response.json();
};
```

## Testing

Use the provided test file `server/test-forgot-password.js` to test the functionality:

```bash
cd server
node test-forgot-password.js
```

Make sure to:
1. Update the `TEST_PHONE` variable with a real phone number
2. Replace the `testOTP` with actual OTP received via SMS/WhatsApp
3. Ensure your server is running on the correct port

## Notes

- The system automatically falls back to SMS if WhatsApp delivery fails
- OTPs are 6-digit random numbers
- Reset tokens contain user/vendor ID and purpose for security
- All passwords are hashed before storing in the database
- The system supports both English and Hindi SMS templates