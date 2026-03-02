# Search Logs User Details Fix

## Problem
User details were not showing in search logs even when logged in as admin or any user.

## Root Cause
The search logger was trying to read from localStorage, but the data structure or timing was causing issues.

## Solution
Changed to use Redux store directly instead of localStorage for more reliable user data access.

## Changes Made

### 1. Redux Store (`src/redux/store.ts`)
**Added named export for store:**
```typescript
export { store };
export default store;
```

### 2. Frontend - Search Logger (`src/utils/searchLogger.ts`)
**Changed from localStorage to Redux store:**
```typescript
import { store } from "../redux/store";

// Get user info from Redux store
const state = store.getState();
const user = state.auth?.user;
const token = state.auth?.token;

let userId = null;
let vendorId = null;

if (user && token) {
  // Get user ID
  const id = user._id || user.id;
  
  // Check if it's a vendor or regular user based on role
  if (user.role === "Vendor" || user.role === "vendor") {
    vendorId = id;
  } else {
    // For Admin, User, or any other role
    userId = id;
  }
  
  console.log("Search log - User info:", { 
    role: user.role, 
    userId, 
    vendorId,
    userName: user.name 
  });
}

// Send log with user/vendor info
await axios.post(searchLogs.CREATE_LOG_API, {
  ...data,
  userId,
  vendorId,
});
```

**Key Changes:**
- Uses Redux store instead of localStorage
- Handles all roles: Admin, User, Vendor
- Admin and User → saved as userId
- Vendor → saved as vendorId
- Added console logs for debugging

### 2. Backend - Controller (`server/controllers/searchLogsCtrl.js`)
**Updated to accept userId/vendorId from request body:**
```javascript
const { searchQuery, category, location, page, resultsCount, userId, vendorId } = req.body;

const searchLog = await SearchLogs.create({
  searchQuery,
  category: category || "All Categories",
  location: location || "Unknown",
  page,
  userId: userId || null,
  vendorId: vendorId || null,
  ipAddress,
  userAgent,
  resultsCount: resultsCount || 0,
});
```

### 3. Admin Dashboard (`src/components/pages/admin/SearchLogs.tsx`)
**Removed IP Address column and added User Details column:**

**Table Header:**
- Removed: "IP Address"
- Added: "User Details"

**Table Body:**
```tsx
<td className="px-6 py-4 text-sm text-gray-600">
  {log.userId || log.vendorId ? (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">
        {log.userId?.name || log.vendorId?.name || "Unknown"}
      </span>
      <span className="text-xs text-gray-500">
        {log.userId?.phone || log.vendorId?.phone || "No phone"}
      </span>
      <span className="text-xs text-gray-400">
        {log.userId ? "User" : "Vendor"}
      </span>
    </div>
  ) : (
    <span className="text-gray-400 italic">Not logged in</span>
  )}
</td>
```

### 4. Excel Export (`server/controllers/searchLogsCtrl.js`)
**Updated columns:**
- Removed: "IP Address"
- Added: "User Type" (User/Vendor/Guest)

**Excel columns:**
```javascript
worksheet.columns = [
  { header: "Date & Time", key: "createdAt", width: 20 },
  { header: "Search Query", key: "searchQuery", width: 30 },
  { header: "Category", key: "category", width: 20 },
  { header: "Location", key: "location", width: 15 },
  { header: "Page", key: "page", width: 12 },
  { header: "Results Count", key: "resultsCount", width: 15 },
  { header: "User Name", key: "userName", width: 20 },
  { header: "User Phone", key: "userPhone", width: 15 },
  { header: "User Type", key: "userType", width: 12 },
];
```

**Excel data:**
```javascript
worksheet.addRow({
  createdAt: new Date(log.createdAt).toLocaleString("en-IN"),
  searchQuery: log.searchQuery,
  category: log.category,
  location: log.location,
  page: log.page,
  resultsCount: log.resultsCount,
  userName: log.userId?.name || log.vendorId?.name || "Not logged in",
  userPhone: log.userId?.phone || log.vendorId?.phone || "-",
  userType: log.userId ? "User" : log.vendorId ? "Vendor" : "Guest",
});
```

## Display Format

### Admin Dashboard Table:
```
User Details Column:
┌─────────────────────┐
│ Rishi Maheshwari    │ ← Name (bold)
│ 9876543210          │ ← Phone (small)
│ Vendor              │ ← Type (smaller, gray)
└─────────────────────┘

OR

┌─────────────────────┐
│ Not logged in       │ ← Italic, gray
└─────────────────────┘
```

### Excel Export:
```
| User Name         | User Phone  | User Type |
|-------------------|-------------|-----------|
| Rishi Maheshwari  | 9876543210  | Vendor    |
| John Doe          | 9123456789  | User      |
| Not logged in     | -           | Guest     |
```

## User Flow

### Admin Searches:
1. Admin is logged in (role: "Admin")
2. Admin searches on home or services page
3. Search logger reads user data from Redux store
4. Saves as userId (not vendorId)
5. Backend saves log with userId reference
6. Admin dashboard shows: Admin Name, Phone, "User"

### Logged In User Searches:
1. User is logged in (role: "User")
2. User searches on home or services page
3. Search logger reads user data from Redux store
4. Saves as userId
5. Backend saves log with userId reference
6. Admin sees: User Name, Phone, "User"

### Logged In Vendor Searches:
1. Vendor is logged in (role: "Vendor")
2. Vendor searches on home or services page
3. Search logger reads user data from Redux store
4. Saves as vendorId
5. Backend saves log with vendorId reference
6. Admin sees: Vendor Name, Phone, "Vendor"

### Guest User Searches:
1. User is not logged in (no token in Redux)
2. User searches on home or services page
3. Search logger sends null for userId and vendorId
4. Backend saves log without user reference
5. Admin sees: "Not logged in" (italic, gray)

## Benefits

1. **User Tracking**: Know which users are searching for what
2. **Vendor Tracking**: Track vendor search behavior separately
3. **Guest Tracking**: Identify searches from non-logged-in users
4. **Privacy**: Removed IP address (not needed)
5. **Better Analytics**: Can analyze search patterns by user type
6. **Contact Info**: Admin has phone numbers for follow-up if needed

## Testing

1. **As Admin:**
   - Login as admin
   - Search on home page or services page
   - Open browser console - should see log: "Search log - User info: { role: 'Admin', userId: '...', vendorId: null, userName: '...' }"
   - Check admin dashboard → Search Logs
   - Should show admin name, phone, "User"

2. **As Regular User:**
   - Login as regular user
   - Search on home page
   - Check browser console for log
   - Check admin dashboard - should show user name, phone, "User"

3. **As Vendor:**
   - Login as vendor
   - Search on services page
   - Check browser console for log
   - Check admin dashboard - should show vendor name, phone, "Vendor"

4. **As Guest:**
   - Logout (clear Redux state)
   - Search on any page
   - Check browser console - should see "Search log - No user logged in"
   - Check admin dashboard - should show "Not logged in"

5. **Excel Export:**
   - Download Excel file
   - Verify columns: no IP, has User Type
   - Verify data shows correctly for all user types (Admin, User, Vendor, Guest)

## Debugging
If user details still don't show:
1. Open browser console
2. Search for something
3. Look for log: "Search log - User info: ..."
4. Check if userId or vendorId is populated
5. Verify user role is correct
6. Check Redux DevTools to see auth state
