# UPI Payment Option Implementation

## Overview
Vendor registration forms में Bank Details के साथ-साथ UPI ID option भी add किया गया है। अब vendors अपनी choice के अनुसार Bank Account details या UPI ID provide कर सकते हैं।

## Features Added

### 1. Payment Method Selection
- **Bank Account** - Traditional bank details (Account Number, IFSC, etc.)
- **UPI ID** - Simple UPI ID entry (e.g., 9876543210@paytm, yourname@ybl)

### 2. Dynamic Form Fields
- Payment method select करने पर relevant fields show होते हैं
- Bank select करने पर: Bank Name, Account Holder Name, Account Number, IFSC Code
- UPI select करने पर: UPI ID field

### 3. Optional Fields
- दोनों payment methods optional हैं
- Vendor चाहे तो बाद में भी add कर सकता है

## Files Modified

### 1. `src/pages/VendorRegister.tsx` (Vendor Registration Form)

#### Schema Changes:
```typescript
const vendorSchema = z.object({
  // ... other fields
  
  // Step 4: Bank Details or UPI
  paymentMethod: z.enum(["bank", "upi"]).optional(),
  bankName: z.string().optional().or(z.literal("")),
  accountHolderName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
  upiId: z.string().optional().or(z.literal("")),
  
  // ... other fields
});
```

#### State Variable:
```typescript
const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");
```

#### UI Changes:
- Radio buttons for payment method selection
- Conditional rendering of Bank/UPI fields
- Helper text for UPI ID format

#### Form Submission:
```typescript
// Payment details - Bank or UPI
formData.append("paymentMethod", paymentMethod);

if (paymentMethod === "bank") {
  // Bank details
  if (vendorData.accountNumber) formData.append("bankDetail[accountNumber]", vendorData.accountNumber);
  if (vendorData.ifscCode) formData.append("bankDetail[IFSC]", vendorData.ifscCode);
  if (vendorData.accountHolderName) formData.append("bankDetail[accountHolderName]", vendorData.accountHolderName);
  if (vendorData.bankName) formData.append("bankDetail[branch]", vendorData.bankName);
} else if (paymentMethod === "upi") {
  // UPI details
  if (vendorData.upiId) formData.append("upiId", vendorData.upiId);
}
```

### 2. `src/components/pages/admin/AdminVendors.tsx` (Admin Vendor Creation)

#### FormData State:
```typescript
const [formData, setFormData] = useState({
  // ... other fields
  
  // Step 4: Bank Details or UPI
  paymentMethod: "bank",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  
  // ... other fields
});
```

#### Submit Data:
```typescript
const submitData = {
  ...vendorData,
  paymentMethod: vendorData.paymentMethod,
  bankDetail: vendorData.paymentMethod === "bank" ? {
    accountNumber: vendorData.accountNumber,
    IFSC: vendorData.ifscCode,
    accountHolderName: vendorData.accountHolderName,
    branch: vendorData.bankName,
  } : undefined,
  upiId: vendorData.paymentMethod === "upi" ? vendorData.upiId : undefined,
  // ... other fields
};
```

## UI/UX Design

### Payment Method Selection
```
┌─────────────────────────────────────────────────────────┐
│ Select Payment Method                                    │
├─────────────────────────────────────────────────────────┤
│  ○ Bank Account              ○ UPI ID                   │
│    Enter your bank details     Enter your UPI ID        │
└─────────────────────────────────────────────────────────┘
```

### Bank Account Fields (when selected)
```
┌─────────────────────────────────────────────────────────┐
│ Bank Name                    Account Holder Name        │
│ [Enter bank name]            [Name as per bank account] │
│                                                          │
│ Account Number               IFSC Code                  │
│ [Enter account number]       [ENTER IFSC CODE]          │
└─────────────────────────────────────────────────────────┘
```

### UPI ID Field (when selected)
```
┌─────────────────────────────────────────────────────────┐
│ UPI ID                                                   │
│ [Enter UPI ID (e.g., yourname@paytm, 9876543210@ybl)]  │
│ 💡 Enter your UPI ID from any UPI app                   │
│    (PhonePe, Google Pay, Paytm, etc.)                   │
└─────────────────────────────────────────────────────────┘
```

## UPI ID Format Examples

Valid UPI ID formats:
- `9876543210@paytm` - Phone number based
- `yourname@ybl` - Yes Bank (Google Pay)
- `username@oksbi` - State Bank of India
- `name@okaxis` - Axis Bank
- `user@okicici` - ICICI Bank
- `mobile@upi` - Generic UPI

## Backend Integration

### Data Sent to Backend:

**For Bank Account:**
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

**For UPI:**
```json
{
  "paymentMethod": "upi",
  "upiId": "9876543210@paytm"
}
```

## Benefits

1. ✅ **Flexibility** - Vendors can choose their preferred payment method
2. ✅ **Simplicity** - UPI ID is easier to remember than bank details
3. ✅ **Modern** - UPI is widely used in India
4. ✅ **Optional** - Both methods are optional
5. ✅ **User-Friendly** - Clear instructions and examples provided

## Testing Scenarios

### Test Case 1: Bank Account Selection
1. Select "Bank Account" option
2. Fill in bank details
3. Submit form
4. Verify bank details are sent to backend

### Test Case 2: UPI ID Selection
1. Select "UPI ID" option
2. Enter UPI ID (e.g., 9876543210@paytm)
3. Submit form
4. Verify UPI ID is sent to backend

### Test Case 3: No Payment Details
1. Don't fill any payment details
2. Submit form
3. Verify form submits successfully (optional fields)

### Test Case 4: Switch Between Methods
1. Select "Bank Account" and fill details
2. Switch to "UPI ID"
3. Verify bank fields are hidden
4. Fill UPI ID
5. Submit form
6. Verify only UPI ID is sent

## Future Enhancements

1. **UPI ID Validation** - Regex validation for UPI ID format
2. **UPI Verification** - Verify UPI ID before submission
3. **Multiple Payment Methods** - Allow both bank and UPI
4. **Payment History** - Track which method was used for payments
5. **QR Code** - Generate UPI QR code for vendors

## Notes

- UPI ID validation can be added in future updates
- Backend should handle both payment methods
- Existing vendors with only bank details will continue to work
- Admin can see which payment method vendor has chosen
