# Payment Details Display Update

## Overview
सभी view/display sections में Bank Details के साथ-साथ UPI ID भी display होने लगा है। अब Payment Method के आधार पर relevant details show होते हैं।

## Files Modified

### 1. `src/components/pages/admin/AdminVendors.tsx` (Partner Details Modal)

#### Changes:
- ✅ Card title changed: "Bank Details" → "Payment Details"
- ✅ Payment Method display added
- ✅ Conditional Bank Details display
- ✅ Conditional UPI ID display

**Before:**
```tsx
<CardTitle>Bank Details</CardTitle>
<CardContent>
  <div>Bank Name: {vendor.bankDetail?.branch}</div>
  <div>Account Holder: {vendor.bankDetail?.accountHolderName}</div>
  <div>Account Number: {vendor.bankDetail?.accountNumber}</div>
  <div>IFSC Code: {vendor.bankDetail?.IFSC}</div>
</CardContent>
```

**After:**
```tsx
<CardTitle>Payment Details</CardTitle>
<CardContent>
  {/* Payment Method */}
  <div>Payment Method: {vendor.paymentMethod || "Bank"}</div>
  
  {/* Bank Details - Only if payment method is bank */}
  {(!vendor.paymentMethod || vendor.paymentMethod === "bank") && (
    <>
      <div>Bank Name: {vendor.bankDetail?.branch}</div>
      <div>Account Holder: {vendor.bankDetail?.accountHolderName}</div>
      <div>Account Number: {vendor.bankDetail?.accountNumber}</div>
      <div>IFSC Code: {vendor.bankDetail?.IFSC}</div>
    </>
  )}
  
  {/* UPI Details - Only if payment method is UPI */}
  {vendor.paymentMethod === "upi" && (
    <div>UPI ID: {vendor.upiId || "Not Added"}</div>
  )}
</CardContent>
```

### 2. `src/components/pages/vendor/VendorProfile.tsx` (Vendor Profile View)

#### Changes:
- ✅ Card title changed: "Bank Details" → "Payment Details"
- ✅ Payment Method display added
- ✅ Conditional Bank Details display
- ✅ Conditional UPI ID display

**Before:**
```tsx
<Card>
  <CardTitle>Bank Details</CardTitle>
  <CardContent>
    <div>Bank Name: {vendor.bankDetail?.branch}</div>
    <div>Account Holder: {vendor.bankDetail?.accountHolderName}</div>
    <div>Account Number: {vendor.bankDetail?.accountNumber}</div>
    <div>IFSC Code: {vendor.bankDetail?.IFSC}</div>
  </CardContent>
</Card>
```

**After:**
```tsx
<Card>
  <CardTitle>Payment Details</CardTitle>
  <CardContent>
    {/* Payment Method */}
    <div>
      <Label>Payment Method</Label>
      <p>{vendor.paymentMethod || "Bank"}</p>
    </div>
    
    {/* Bank Details */}
    {(!vendor.paymentMethod || vendor.paymentMethod === "bank") && (
      <>
        <div>Bank Name: {vendor.bankDetail?.branch}</div>
        <div>Account Holder: {vendor.bankDetail?.accountHolderName}</div>
        <div>Account Number: {vendor.bankDetail?.accountNumber}</div>
        <div>IFSC Code: {vendor.bankDetail?.IFSC}</div>
      </>
    )}
    
    {/* UPI Details */}
    {vendor.paymentMethod === "upi" && (
      <div>
        <Label>UPI ID</Label>
        <p>{vendor.upiId || "-"}</p>
      </div>
    )}
  </CardContent>
</Card>
```

## Display Logic

### Payment Method Display:
```
Payment Method: Bank (or UPI)
```

### For Bank Payment Method:
```
┌─────────────────────────────────────────┐
│ Payment Details                          │
├─────────────────────────────────────────┤
│ Payment Method: Bank                     │
│                                          │
│ Bank Name: SBI                           │
│ Account Holder: Rishi Maheshwari        │
│ Account Number: 008897726565656         │
│ IFSC Code: SBI0052                      │
└─────────────────────────────────────────┘
```

### For UPI Payment Method:
```
┌─────────────────────────────────────────┐
│ Payment Details                          │
├─────────────────────────────────────────┤
│ Payment Method: UPI                      │
│                                          │
│ UPI ID: 9009594538@paytm                │
└─────────────────────────────────────────┘
```

### For No Payment Method (Default to Bank):
```
┌─────────────────────────────────────────┐
│ Payment Details                          │
├─────────────────────────────────────────┤
│ Payment Method: Bank                     │
│                                          │
│ Bank Name: Not Added                     │
│ Account Holder: Not Added                │
│ Account Number: Not Added                │
│ IFSC Code: Not Added                     │
└─────────────────────────────────────────┘
```

## Conditional Rendering Logic

### Bank Details Display Condition:
```typescript
{(!vendor.paymentMethod || vendor.paymentMethod === "bank") && (
  // Show bank details
)}
```

**Explanation:**
- If `paymentMethod` is not set (undefined/null) → Show bank details (backward compatibility)
- If `paymentMethod === "bank"` → Show bank details
- Otherwise → Don't show bank details

### UPI Details Display Condition:
```typescript
{vendor.paymentMethod === "upi" && (
  // Show UPI ID
)}
```

**Explanation:**
- Only show UPI ID if `paymentMethod === "upi"`

## Benefits

1. ✅ **Clear Display** - Payment method clearly shown
2. ✅ **Conditional Rendering** - Only relevant details displayed
3. ✅ **Backward Compatible** - Works with existing vendors
4. ✅ **User Friendly** - Easy to understand payment setup
5. ✅ **Consistent** - Same logic in Admin and Vendor views

## User Experience

### Admin View (Partner Details Modal):
1. Admin clicks on vendor to view details
2. Scrolls to "Payment Details" section
3. Sees payment method (Bank or UPI)
4. Sees relevant payment details based on method

### Vendor View (Profile Page):
1. Vendor opens their profile
2. Scrolls to "Payment Details" card
3. Sees their payment method
4. Sees their payment details (Bank or UPI)

## Testing Scenarios

### Test Case 1: Vendor with Bank Details
1. Open vendor profile/details
2. Check "Payment Details" section
3. Verify "Payment Method: Bank" is shown
4. Verify all bank details are displayed
5. Verify UPI ID is NOT displayed

### Test Case 2: Vendor with UPI
1. Open vendor profile/details
2. Check "Payment Details" section
3. Verify "Payment Method: UPI" is shown
4. Verify UPI ID is displayed
5. Verify bank details are NOT displayed

### Test Case 3: Vendor with No Payment Details
1. Open vendor profile/details
2. Check "Payment Details" section
3. Verify "Payment Method: Bank" is shown (default)
4. Verify "Not Added" is shown for all bank fields
5. Verify UPI ID is NOT displayed

### Test Case 4: Old Vendor (No paymentMethod field)
1. Open old vendor profile/details
2. Check "Payment Details" section
3. Verify "Payment Method: Bank" is shown (default)
4. Verify existing bank details are displayed
5. Verify backward compatibility works

## Backward Compatibility

### For Existing Vendors:
- Vendors without `paymentMethod` field → Default to "Bank"
- Existing bank details → Displayed normally
- No UPI ID → Not displayed
- No breaking changes

### Database:
- No migration required
- Existing documents work as-is
- New field `paymentMethod` is optional

## Notes

- Card title changed from "Bank Details" to "Payment Details"
- Payment method defaults to "Bank" if not set
- Conditional rendering ensures clean display
- Icons remain consistent (CreditCard, Building, User)
- "Not Added" shown for missing fields
