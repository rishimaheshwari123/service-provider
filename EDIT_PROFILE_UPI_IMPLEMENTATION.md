# Edit Profile UPI Implementation

## Overview
Admin और Vendor दोनों के Edit Profile/Partner forms में UPI payment option successfully add किया गया है।

## Files Modified

### 1. `src/components/pages/admin/VendorProfileMangeByAdmin.tsx` (Admin Edit Partner)

#### Interface Updated:
```typescript
interface VendorData {
  // ... existing fields
  
  bankDetail?: {
    accountNumber?: string;
    IFSC?: string;
    accountHolderName?: string;
    branch?: string;
  };
  paymentMethod?: "bank" | "upi";
  upiId?: string;
  
  // ... other fields
}
```

#### UI Changes - Step 4:
- ✅ Payment method selection (Bank/UPI) with radio buttons
- ✅ Conditional rendering of Bank fields
- ✅ Conditional rendering of UPI field
- ✅ Helper text for UPI ID format

**Payment Method Selection:**
```tsx
<RadioGroup
  value={formData.paymentMethod || "bank"}
  onValueChange={(val: "bank" | "upi") => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: val,
    }));
  }}
>
  <RadioGroupItem value="bank" id="edit-payment-bank" />
  <RadioGroupItem value="upi" id="edit-payment-upi" />
</RadioGroup>
```

**Conditional Bank Fields:**
```tsx
{(formData.paymentMethod || "bank") === "bank" && (
  <>
    {/* Bank Name, Account Holder, Account Number, IFSC */}
  </>
)}
```

**Conditional UPI Field:**
```tsx
{formData.paymentMethod === "upi" && (
  <div className="space-y-2">
    <Label>UPI ID</Label>
    <Input 
      value={formData.upiId || ""} 
      onChange={(e) => handleInputChange("upiId", e.target.value)}
      placeholder="Enter UPI ID (e.g., yourname@paytm, 9876543210@ybl)" 
    />
  </div>
)}
```

### 2. `src/components/pages/vendor/VendorProfile.tsx` (Vendor Edit Profile)

#### Interface Updated:
```typescript
interface VendorData {
  // ... existing fields
  
  bankDetail?: {
    accountNumber?: string;
    IFSC?: string;
    accountHolderName?: string;
    branch?: string;
  };
  paymentMethod?: "bank" | "upi";
  upiId?: string;
  
  // ... other fields
}
```

#### UI Changes - Step 4:
- ✅ Same payment method selection as Admin
- ✅ Same conditional rendering logic
- ✅ Same UPI field with helper text

**Payment Method Selection:**
```tsx
<RadioGroup
  value={formData.paymentMethod || "bank"}
  onValueChange={(val: "bank" | "upi") => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: val,
    }));
  }}
>
  <RadioGroupItem value="vendor-payment-bank" />
  <RadioGroupItem value="vendor-payment-upi" />
</RadioGroup>
```

## UI/UX Design

### Payment Method Selection (Both Forms)
```
┌─────────────────────────────────────────────────────────┐
│ Select Payment Method                                    │
├─────────────────────────────────────────────────────────┤
│  ○ Bank Account              ○ UPI ID                   │
│    Bank details                UPI payment              │
└─────────────────────────────────────────────────────────┘
```

### Bank Account View (when selected)
```
┌─────────────────────────────────────────────────────────┐
│ Bank Name                    Account Holder Name        │
│ [Enter bank name]            [Name as per bank account] │
│                                                          │
│ Account Number               IFSC Code                  │
│ [Enter account number]       [ENTER IFSC CODE]          │
└─────────────────────────────────────────────────────────┘
```

### UPI ID View (when selected)
```
┌─────────────────────────────────────────────────────────┐
│ UPI ID                                                   │
│ [Enter UPI ID (e.g., yourname@paytm, 9876543210@ybl)]  │
│ 💡 Enter UPI ID from any UPI app                        │
│    (PhonePe, Google Pay, Paytm, etc.)                   │
└─────────────────────────────────────────────────────────┘
```

## Features

### 1. Payment Method Toggle
- Radio buttons for easy switching
- Clear visual distinction between options
- Default to "bank" if not set

### 2. Conditional Field Display
- Only relevant fields shown based on selection
- Smooth transition between views
- No confusion about which fields to fill

### 3. Data Persistence
- Selected payment method saved in formData
- Bank details preserved when switching to UPI
- UPI ID preserved when switching to Bank

### 4. User Guidance
- Helper text for UPI ID format
- Examples provided (e.g., `9876543210@paytm`)
- Clear labels and placeholders

## Data Flow

### Admin Edit Partner Flow:
1. Admin opens Edit Partner modal
2. Existing payment method loaded from vendor data
3. Admin can switch between Bank/UPI
4. Relevant fields displayed based on selection
5. On save, updated payment details sent to backend

### Vendor Edit Profile Flow:
1. Vendor opens Edit Profile
2. Existing payment method loaded
3. Vendor can switch between Bank/UPI
4. Relevant fields displayed
5. On save, profile update request created with new payment details

## Backend Integration

### Update Request Format:

**Switching to Bank:**
```json
{
  "paymentMethod": "bank",
  "bankDetail": {
    "accountNumber": "1234567890",
    "IFSC": "SBIN0001234",
    "accountHolderName": "John Doe",
    "branch": "State Bank of India"
  }
}
```

**Switching to UPI:**
```json
{
  "paymentMethod": "upi",
  "upiId": "9876543210@paytm"
}
```

## Testing Scenarios

### Test Case 1: Admin Edit - Bank to UPI
1. Open Edit Partner modal for vendor with bank details
2. Click on "UPI ID" radio button
3. Verify bank fields disappear
4. Enter UPI ID
5. Save changes
6. Verify UPI ID saved and bank details cleared

### Test Case 2: Admin Edit - UPI to Bank
1. Open Edit Partner modal for vendor with UPI
2. Click on "Bank Account" radio button
3. Verify UPI field disappears
4. Enter bank details
5. Save changes
6. Verify bank details saved and UPI ID cleared

### Test Case 3: Vendor Edit - New Payment Method
1. Vendor with no payment details opens profile
2. Select payment method (Bank or UPI)
3. Fill in relevant details
4. Submit profile update request
5. Verify request created with payment details

### Test Case 4: Vendor Edit - Switch Payment Method
1. Vendor with existing payment method opens profile
2. Switch to different payment method
3. Fill in new details
4. Submit profile update request
5. Verify request contains new payment method

## Benefits

1. ✅ **Consistent UX** - Same interface in Admin and Vendor forms
2. ✅ **Easy Switching** - Simple radio button toggle
3. ✅ **Clear Display** - Only relevant fields shown
4. ✅ **Data Integrity** - Proper state management
5. ✅ **User Friendly** - Helper text and examples provided

## Compatibility

### With Existing Data:
- Vendors with only bank details: Default to "bank" method
- Vendors with only UPI: Show UPI selected
- Vendors with neither: Default to "bank" method
- No data migration required

### With Backend:
- Backend controller handles both methods
- Proper field clearing when switching
- Compatible with existing vendor documents

## Notes

- Default payment method is "bank" for backward compatibility
- Both forms use same logic and UI components
- TypeScript interfaces properly typed
- No compilation errors
- Only CSS warnings (non-critical)

## Future Enhancements

1. **Validation** - Add UPI ID format validation
2. **Verification** - Verify UPI ID before saving
3. **History** - Show payment method change history
4. **Multiple Methods** - Allow both bank and UPI simultaneously
5. **QR Code** - Generate UPI QR code in view mode
