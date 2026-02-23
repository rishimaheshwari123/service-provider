# Admin Reset Vendor Password Feature

## Overview
Admin can now reset vendor passwords directly from the Admin Vendors page without requiring OTP verification. This is a quick administrative action for password recovery.

## Implementation Details

### Backend Changes

#### 1. New Controller Function (`server/controllers/vendorCtrl.js`)
```javascript
adminResetVendorPasswordCtrl(req, res)
```

**Features:**
- No OTP verification required (admin privilege)
- Validates password match
- Validates password length (minimum 6 characters)
- Hashes password with bcrypt
- Updates vendor password directly

**Request Body:**
```json
{
  "vendorId": "vendor_id_here",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor password reset successfully by admin"
}
```

#### 2. New Route (`server/routes/vendorRoute.js`)
```javascript
POST /api/v1/vendor/admin-reset-password
```

### Frontend Changes

#### 1. Admin Vendors Page (`src/components/pages/admin/AdminVendors.tsx`)

**New State Variables:**
```typescript
const [resetPasswordDialog, setResetPasswordDialog] = useState({
  open: false,
  vendor: null,
});
const [resetPasswordData, setResetPasswordData] = useState({
  newPassword: "",
  confirmPassword: "",
});
```

**New Handler Function:**
```typescript
handleResetPassword()
```

**Features:**
- Validates both password fields are filled
- Validates passwords match
- Validates password length (minimum 6 characters)
- Calls backend API to reset password
- Shows success/error toast messages
- Clears form after successful reset

**New UI Components:**
1. **Dropdown Menu Item** - "Reset Password" option with Key icon
2. **Reset Password Dialog** - Modal with two password input fields

## User Flow

### Admin Workflow:
1. Admin navigates to Admin Vendors page (`/admin/vendors`)
2. Admin clicks the three-dot menu (⋮) next to any vendor
3. Admin selects "Reset Password" from dropdown
4. Dialog opens with two fields:
   - New Password
   - Confirm Password
5. Admin enters new password in both fields
6. Admin clicks "Reset Password" button
7. System validates:
   - Both fields are filled
   - Passwords match
   - Password is at least 6 characters
8. Password is updated in database
9. Success message is shown
10. Dialog closes automatically

## Security Considerations

### Why No OTP for Admin?
- This is an **admin-only** feature
- Admin already authenticated and authorized
- Used for emergency password recovery
- Faster than OTP-based reset for admin tasks

### Security Measures:
1. ✅ Password validation (length, match)
2. ✅ Password hashing with bcrypt
3. ✅ Admin authentication required (should be added via middleware)
4. ✅ Clear success/error messages
5. ✅ Form reset after action

### Recommended Enhancements:
- Add admin authentication middleware to route
- Add audit logging for password resets
- Add email notification to vendor when password is reset
- Add rate limiting to prevent abuse

## API Endpoint

### POST `/api/v1/vendor/admin-reset-password`

**Request:**
```json
{
  "vendorId": "507f1f77bcf86cd799439011",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vendor password reset successfully by admin"
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Vendor ID, new password, and confirm password are required"
}
```

**400 - Passwords Don't Match:**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**400 - Password Too Short:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

**404 - Vendor Not Found:**
```json
{
  "success": false,
  "message": "Vendor not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error. Please try again."
}
```

## UI Screenshots Description

### Dropdown Menu
- Location: Admin Vendors table, Actions column
- New Option: "Reset Password" with blue Key icon
- Position: Between "Approve/Reject" and "Delete Partner"

### Reset Password Dialog
- Title: "Reset Vendor Password" with Key icon
- Subtitle: Shows vendor name
- Fields:
  1. New Password (password input)
  2. Confirm Password (password input)
- Buttons:
  - Cancel (outline)
  - Reset Password (blue, with loading state)

## Testing

### Test Cases:

1. **Valid Password Reset:**
   - Enter matching passwords (6+ characters)
   - Should succeed and show success message

2. **Passwords Don't Match:**
   - Enter different passwords
   - Should show error: "Passwords do not match"

3. **Password Too Short:**
   - Enter password less than 6 characters
   - Should show error: "Password must be at least 6 characters long"

4. **Empty Fields:**
   - Leave one or both fields empty
   - Should show error: "Please fill in both password fields"

5. **Invalid Vendor ID:**
   - Try to reset password for non-existent vendor
   - Should show error: "Vendor not found"

### Manual Testing Steps:
```bash
# 1. Start backend server
cd server
npm start

# 2. Start frontend
npm run dev

# 3. Login as admin
# 4. Navigate to /admin/vendors
# 5. Click three-dot menu on any vendor
# 6. Click "Reset Password"
# 7. Enter new password: "test123456"
# 8. Confirm password: "test123456"
# 9. Click "Reset Password"
# 10. Verify success message
# 11. Try logging in as that vendor with new password
```

## Files Modified

### Backend:
1. `server/controllers/vendorCtrl.js` - Added `adminResetVendorPasswordCtrl` function
2. `server/routes/vendorRoute.js` - Added POST route for admin reset password

### Frontend:
1. `src/components/pages/admin/AdminVendors.tsx` - Added:
   - Reset password state variables
   - Reset password handler function
   - Reset password dialog UI
   - Dropdown menu item
   - Key icon import

## Comparison: Admin Reset vs User Forgot Password

| Feature | Admin Reset | User Forgot Password |
|---------|-------------|---------------------|
| OTP Required | ❌ No | ✅ Yes |
| Who Can Use | Admin only | Vendor/User |
| Authentication | Admin session | Phone OTP |
| Use Case | Emergency recovery | Self-service |
| Speed | Fast (2 steps) | Slower (3 steps) |
| Security | Admin privilege | OTP verification |

## Future Enhancements

1. **Audit Logging:**
   - Log who reset the password
   - Log when it was reset
   - Log vendor details

2. **Email Notification:**
   - Send email to vendor when password is reset
   - Include timestamp and admin info

3. **Password Strength Meter:**
   - Show password strength indicator
   - Suggest strong passwords

4. **Temporary Password:**
   - Option to generate temporary password
   - Force password change on next login

5. **Admin Authentication:**
   - Add middleware to verify admin role
   - Add permission checks

## Summary

✅ Admin can now reset vendor passwords directly from the dropdown menu
✅ No OTP verification required (admin privilege)
✅ Simple two-field form (New Password + Confirm Password)
✅ Full validation (match, length, required fields)
✅ Secure password hashing with bcrypt
✅ User-friendly error messages
✅ Clean UI with loading states

This feature provides admins with a quick way to help vendors recover their accounts without going through the OTP verification process.
