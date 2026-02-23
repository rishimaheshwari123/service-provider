# Admin Reset Password - Fixed Implementation

## Changes Made

### 1. Fixed BASE_URL in `src/service/apis.js`
**Before:**
```javascript
export const BASE_URL = "http://localhost:8000/api/v1"
```

**After:**
```javascript
export const BASE_URL = "http://localhost:8080/api/v1"
```

### 2. Added Admin Reset Password Endpoint in `src/service/apis.js`
```javascript
export const vendor = {
  // ... existing endpoints
  ADMIN_RESET_PASSWORD_API: BASE_URL + "/vendor/admin-reset-password",
}
```

### 3. Updated AdminVendors Component to Use API Endpoint

**Added Import:**
```typescript
import { vendor } from "@/service/apis";
```

**Updated handleResetPassword Function:**
```typescript
// Before (hardcoded URL):
const response = await fetch("http://localhost:8080/api/v1/vendor/admin-reset-password", {

// After (using API constant):
const response = await fetch(vendor.ADMIN_RESET_PASSWORD_API, {
```

## Benefits of This Approach

### 1. Centralized Configuration
- All API endpoints are defined in one place (`src/service/apis.js`)
- Easy to switch between environments (local, staging, production)
- No need to search through code to find hardcoded URLs

### 2. Easy Environment Switching
```javascript
// Development
export const BASE_URL = "http://localhost:8080/api/v1"

// Production
export const BASE_URL = "https://api.meragharsansaar.com/api/v1"

// Staging
export const BASE_URL = "https://service-provider-6ufz.onrender.com/api/v1"
```

### 3. Type Safety
- Using constants prevents typos in URLs
- IDE autocomplete helps find the right endpoint
- Easier to refactor if endpoint names change

### 4. Maintainability
- Change the URL once, it updates everywhere
- Clear organization of all API endpoints
- Easy to see all available endpoints at a glance

## File Structure

```
src/
├── service/
│   ├── apis.js                 # ✅ All API endpoints defined here
│   └── operations/
│       └── vendor.js           # API call functions
└── components/
    └── pages/
        └── admin/
            └── AdminVendors.tsx # ✅ Uses vendor.ADMIN_RESET_PASSWORD_API
```

## How to Use in Other Components

If you need to add more admin functions, follow this pattern:

### Step 1: Add endpoint to `src/service/apis.js`
```javascript
export const vendor = {
  // ... existing endpoints
  ADMIN_RESET_PASSWORD_API: BASE_URL + "/vendor/admin-reset-password",
  ADMIN_UPDATE_VENDOR_API: BASE_URL + "/vendor/admin-update",  // New endpoint
}
```

### Step 2: Import and use in component
```typescript
import { vendor } from "@/service/apis";

const response = await fetch(vendor.ADMIN_UPDATE_VENDOR_API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

## Testing

### 1. Verify BASE_URL is correct
```javascript
// In browser console or component:
import { vendor } from "@/service/apis";
console.log(vendor.ADMIN_RESET_PASSWORD_API);
// Should output: "http://localhost:8080/api/v1/vendor/admin-reset-password"
```

### 2. Test the feature
1. Navigate to `/admin/vendors`
2. Click three-dot menu on any vendor
3. Click "Reset Password"
4. Enter new password twice
5. Click "Reset Password" button
6. Should see success message

### 3. Check server logs
```
📝 Admin reset password request received
Request body: { vendorId: '...', newPassword: '...', confirmPassword: '...' }
🔍 Looking for vendor: ...
✅ Vendor found: ...
✅ Admin reset password for vendor: ...
```

## Environment Configuration

### For Production Deployment

1. **Update BASE_URL in `src/service/apis.js`:**
```javascript
// Comment out local, uncomment production
// export const BASE_URL = "http://localhost:8080/api/v1"
export const BASE_URL = "https://api.meragharsansaar.com/api/v1"
```

2. **Or use environment variables:**
```javascript
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:8080/api/v1";
```

Then create `.env` file:
```
VITE_APP_BASE_URL=https://api.meragharsansaar.com/api/v1
```

## All Vendor Endpoints

Current vendor endpoints in `apis.js`:

```javascript
export const vendor = {
  LOGIN_API: BASE_URL + "/vendor/login",
  SIGNUP_API: BASE_URL + "/vendor/register",
  SEND_OTP_API: BASE_URL + "/vendor/send-otp",
  VERIFY_OTP_API: BASE_URL + "/vendor/verify-otp",
  GET_ALL_VENDOR: BASE_URL + "/vendor/getAll",
  GET_VENDOR: BASE_URL + "/vendor/get",
  UPDATE_VENDOR: BASE_URL + "/vendor/update",
  UPDATE_VENDOR_PROFILE: BASE_URL + "/vendor/update-profile",
  UPDATE_VENDOR_PERSANTAGE: BASE_URL + "/vendor/update-percentage",
  UPDATE_VENDOR_WORKING_HOURS: BASE_URL + "/vendor/working-hours",
  REQUST_FOR_THE_UPDATE_PROFILE_API: BASE_URL + "/vendor/request-update",
  DELETE_VENDOR: BASE_URL + "/vendor/delete",
  MY_PROFILE: BASE_URL + "/vendor/my-profile",
  FORGOT_PASSWORD_API: BASE_URL + "/vendor/forgot-password",
  VERIFY_RESET_OTP_API: BASE_URL + "/vendor/verify-reset-otp",
  RESET_PASSWORD_API: BASE_URL + "/vendor/reset-password",
  ADMIN_RESET_PASSWORD_API: BASE_URL + "/vendor/admin-reset-password", // ✅ NEW
}
```

## Summary

✅ Fixed BASE_URL from port 8000 to 8080
✅ Added ADMIN_RESET_PASSWORD_API endpoint to apis.js
✅ Updated AdminVendors component to use the API constant
✅ No more hardcoded URLs in the component
✅ Easy to switch between environments
✅ Better maintainability and type safety

Now the admin reset password feature uses the centralized API configuration, making it easier to maintain and deploy to different environments.
