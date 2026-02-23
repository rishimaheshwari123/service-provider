# Fix: Admin Reset Password Error

## Error Message
```
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

## Root Cause
This error occurs when:
1. The server is not running
2. The server hasn't been restarted after adding the new route
3. The route is not properly registered
4. There's a server-side error that's not returning JSON

## Solution Steps

### Step 1: Restart the Backend Server

The new route needs the server to be restarted to be registered.

```bash
# Stop the current server (Ctrl+C)
# Then restart it

cd server
npm start
# or
node index.js
# or
nodemon index.js
```

### Step 2: Verify Server is Running

Check the console output for:
```
Server is running on port 8080
Database connected successfully
```

### Step 3: Test the Endpoint

You can test the endpoint using curl or the test script:

#### Option A: Using curl
```bash
curl -X POST http://localhost:8080/api/v1/vendor/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "YOUR_VENDOR_ID_HERE",
    "newPassword": "test123456",
    "confirmPassword": "test123456"
  }'
```

#### Option B: Using the test script
```bash
# First, update the vendorId in test-admin-reset-password.js
# Then run:
node test-admin-reset-password.js
```

### Step 4: Check Server Logs

When you click "Reset Password" in the UI, check the server console for:

```
📝 Admin reset password request received
Request body: { vendorId: '...', newPassword: '...', confirmPassword: '...' }
🔍 Looking for vendor: ...
✅ Vendor found: ...
✅ Admin reset password for vendor: ...
```

If you don't see these logs, the request is not reaching the server.

### Step 5: Verify the Route is Registered

Add this temporary debug code to `server/index.js` after the routes are registered:

```javascript
// Debug: List all registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Route:', r.route.path);
  }
});
```

Look for `/api/v1/vendor/admin-reset-password` in the output.

## Common Issues and Fixes

### Issue 1: Server Not Restarted
**Symptom:** Route not found (404)
**Fix:** Restart the server

### Issue 2: CORS Error
**Symptom:** CORS policy error in browser console
**Fix:** Check CORS configuration in `server/index.js`

### Issue 3: Vendor ID Invalid
**Symptom:** "Vendor not found" error
**Fix:** Make sure you're passing the correct vendor `_id` from MongoDB

### Issue 4: Server Crash
**Symptom:** Server stops responding
**Fix:** Check server console for error stack trace

## Debugging Checklist

- [ ] Server is running on port 8080
- [ ] No errors in server console
- [ ] Route appears in registered routes list
- [ ] Request reaches the server (check logs)
- [ ] Vendor ID is valid MongoDB ObjectId
- [ ] Network tab shows request is sent
- [ ] Response status is 200 (not 404, 500, etc.)

## Expected Behavior

### Success Flow:
1. User clicks "Reset Password" in dropdown
2. Dialog opens with two password fields
3. User enters matching passwords (6+ characters)
4. User clicks "Reset Password" button
5. Frontend sends POST request to backend
6. Backend validates and updates password
7. Backend returns success JSON response
8. Frontend shows success toast
9. Dialog closes

### Server Console Output (Success):
```
📝 Admin reset password request received
Request body: { vendorId: '...', newPassword: '...', confirmPassword: '...' }
🔍 Looking for vendor: 6766e0e0e0e0e0e0e0e0e0e0
✅ Vendor found: Rishi Maheshwari 9009594537
✅ Admin reset password for vendor: 9009594537
```

### Frontend Console Output (Success):
```
(No errors)
```

### Server Console Output (Error):
```
📝 Admin reset password request received
Request body: { vendorId: '...', newPassword: '...', confirmPassword: '...' }
❌ Validation failed: Passwords don't match
```

## Quick Fix Commands

```bash
# 1. Stop server
Ctrl+C

# 2. Restart server
cd server
npm start

# 3. Test in browser
# Go to http://localhost:8080/admin/vendors
# Click three-dot menu on any vendor
# Click "Reset Password"
# Enter password twice
# Click "Reset Password" button

# 4. Check server console for logs
```

## If Still Not Working

1. **Check if the function is exported:**
   - Open `server/controllers/vendorCtrl.js`
   - Scroll to bottom
   - Verify `adminResetVendorPasswordCtrl` is in the exports

2. **Check if the route is imported:**
   - Open `server/routes/vendorRoute.js`
   - Line 1 should include `adminResetVendorPasswordCtrl` in the destructuring

3. **Check if the route is defined:**
   - Open `server/routes/vendorRoute.js`
   - Should have: `router.post("/admin-reset-password", adminResetVendorPasswordCtrl)`

4. **Check server startup:**
   - Look for any errors when server starts
   - Verify MongoDB connection is successful

## Alternative: Use Postman/Thunder Client

If the UI still doesn't work, test with Postman:

1. **Method:** POST
2. **URL:** `http://localhost:8080/api/v1/vendor/admin-reset-password`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "vendorId": "6766e0e0e0e0e0e0e0e0e0e0",
  "newPassword": "test123456",
  "confirmPassword": "test123456"
}
```

If Postman works but UI doesn't, the issue is in the frontend code.
If Postman doesn't work, the issue is in the backend.

## Contact Points

If you're still stuck, check:
1. Server console logs
2. Browser console logs (F12)
3. Network tab in browser DevTools
4. MongoDB connection status

The improved error handling in the frontend will now show more specific error messages to help identify the issue.
