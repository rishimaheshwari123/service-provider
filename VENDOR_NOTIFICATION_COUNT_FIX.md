# Vendor Notification Count Fix

## Problem
Sidebar में "9 requests" दिख रहे थे लेकिन actual page में "No pending requests" show हो रहा था।

## Root Cause
दो अलग-अलग data sources use हो रहे थे:

### Before Fix:

1. **Sidebar Count (`useVendorNotifications` hook)**
   - API: `getAllVendorAPI()` - सभी vendors fetch करता था
   - Filter: `vendor.updateProfileRequest === "requested"`
   - Problem: यह vendor table में एक field check कर रहा था जो outdated हो सकता है

2. **Page Display (`VendorProfileUpdateNotifications` component)**
   - API: `getPendingUpdateRequestsAPI()` - actual pending requests fetch करता था
   - Filter: `request.status === "pending"`
   - यह correct data था

## Solution
`useVendorNotifications` hook को update किया गया ताकि वह same API use करे जो page use कर रहा है।

### After Fix:

```typescript
// src/hooks/useVendorNotifications.ts
import { getPendingUpdateRequestsAPI } from "@/service/operations/vendorProfileUpdateRequest";

export const useVendorNotifications = () => {
  const fetchPendingRequests = async () => {
    const response = await getPendingUpdateRequestsAPI();
    
    if (response && Array.isArray(response)) {
      const pendingCount = response.filter(
        (request) => request.status === "pending"
      ).length;
      setPendingRequestsCount(pendingCount);
    }
  };
  
  // ... rest of the code
};
```

## Changes Made

### File: `src/hooks/useVendorNotifications.ts`

**Before:**
```typescript
import { getAllVendorAPI } from "@/service/operations/vendor";

const response = await getAllVendorAPI();
const pendingCount = response.filter(
  (vendor) => vendor.updateProfileRequest === "requested"
).length;
```

**After:**
```typescript
import { getPendingUpdateRequestsAPI } from "@/service/operations/vendorProfileUpdateRequest";

const response = await getPendingUpdateRequestsAPI();
const pendingCount = response.filter(
  (request) => request.status === "pending"
).length;
```

## Benefits

1. ✅ **Consistent Data**: Sidebar और page दोनों same data source use करते हैं
2. ✅ **Accurate Count**: Real-time accurate pending requests count
3. ✅ **Single Source of Truth**: `getPendingUpdateRequestsAPI` ही single source है
4. ✅ **No Confusion**: User को confusing numbers नहीं दिखेंगे

## Testing

### Test Scenarios:
1. ✅ जब कोई pending request नहीं है - Sidebar में "0" और page में "No pending requests"
2. ✅ जब pending requests हैं - Sidebar और page में same count
3. ✅ Request approve/reject करने के बाद - Count automatically update हो जाता है
4. ✅ Auto-refresh (30 seconds) - Count automatically refresh होता है

## API Endpoints

### Correct API (Now Used):
- **Endpoint**: `GET /api/vendor-profile-update-requests/pending`
- **Function**: `getPendingUpdateRequestsAPI()`
- **Returns**: Array of pending update requests
- **Filter**: `request.status === "pending"`

### Old API (No Longer Used for Count):
- **Endpoint**: `GET /api/vendors`
- **Function**: `getAllVendorAPI()`
- **Returns**: Array of all vendors
- **Issue**: `vendor.updateProfileRequest` field may be outdated

## Related Files

1. **`src/hooks/useVendorNotifications.ts`** - Fixed hook
2. **`src/components/pages/admin/Sidebar.tsx`** - Uses the hook
3. **`src/components/pages/admin/VendorProfileUpdateNotifications.tsx`** - Displays requests
4. **`src/service/operations/vendorProfileUpdateRequest.ts`** - API functions

## Notes

- Hook automatically refreshes every 30 seconds
- `refreshNotifications()` function can be called manually to refresh immediately
- Count updates automatically when requests are approved/rejected
