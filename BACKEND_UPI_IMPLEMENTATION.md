# Backend UPI Implementation

## Overview
Backend में Vendor Model और Controller को update किया गया है ताकि UPI payment method को support किया जा सके।

## Files Modified

### 1. `server/models/vendorModel.js` (Vendor Model)

#### New Fields Added:

```javascript
// Payment Method (Bank or UPI)
paymentMethod: {
    type: String,
    enum: ["bank", "upi"],
    default: "bank",
},
upiId: {
    type: String,
    trim: true,
},
```

#### Schema Structure:
```javascript
const vendorSchema = new mongoose.Schema({
    // ... existing fields
    
    bankDetail: {
        accountNumber: { type: String, trim: true },
        IFSC: { type: String, trim: true },
        accountHolderName: { type: String, trim: true },
        branch: { type: String, trim: true },
    },

    // Payment Method (Bank or UPI)
    paymentMethod: {
        type: String,
        enum: ["bank", "upi"],
        default: "bank",
    },
    upiId: {
        type: String,
        trim: true,
    },

    // ... other fields
});
```

### 2. `server/controllers/vendorCtrl.js` (Vendor Controller)

#### A. `vendorRegisterCtrl` Function

**Payment Method Handling:**
```javascript
// Extract payment method and UPI ID from request
let paymentMethodValue = req.body.paymentMethod || "bank";
let upiIdValue = req.body.upiId || "";

// Handle bank details only if payment method is bank
if (paymentMethodValue === "bank" && (req.body['bankDetail[accountNumber]'] || 
    req.body['bankDetail[IFSC]'] || req.body['bankDetail[accountHolderName]'] || 
    req.body['bankDetail[branch]'])) {
  processedBankDetail = {
    accountNumber: sanitizeValue(req.body['bankDetail[accountNumber]']) || '',
    IFSC: sanitizeValue(req.body['bankDetail[IFSC]']) || '',
    accountHolderName: sanitizeValue(req.body['bankDetail[accountHolderName]']) || '',
    branch: sanitizeValue(req.body['bankDetail[branch]']) || '',
  };
} else if (paymentMethodValue === "upi") {
  // Clear bank details if UPI is selected
  processedBankDetail = {
    accountNumber: '',
    IFSC: '',
    accountHolderName: '',
    branch: '',
  };
}
```

**Vendor Update:**
```javascript
const user = await vendorModel.findByIdAndUpdate(
  existingUser._id,
  {
    ...sanitizedData,
    password: hashedPassword,
    numberOfStaff: processedNumberOfStaff,
    paymentMethod: paymentMethodValue,
    bankDetail: processedBankDetail, 
    upiId: paymentMethodValue === "upi" ? sanitizeValue(upiIdValue) : "",
    experience: processedExperience,
    ...fileUpdates
  },
  { new: true }
);
```

#### B. `updateVendorProfileCtrl` Function

**Payment Method Handling:**
```javascript
// Transform bank detail fields from request body
const paymentMethod = updateData.paymentMethod || "bank";

if (paymentMethod === "bank" && (updateData['bankDetail[accountNumber]'] || 
    updateData['bankDetail[IFSC]'] || updateData['bankDetail[accountHolderName]'] || 
    updateData['bankDetail[branch]'])) {
  updateData.bankDetail = {
    accountNumber: updateData['bankDetail[accountNumber]'] || '',
    IFSC: updateData['bankDetail[IFSC]'] || '',
    accountHolderName: updateData['bankDetail[accountHolderName]'] || '',
    branch: updateData['bankDetail[branch]'] || '',
  };

  // Delete flattened fields
  delete updateData['bankDetail[accountNumber]'];
  delete updateData['bankDetail[IFSC]'];
  delete updateData['bankDetail[accountHolderName]'];
  delete updateData['bankDetail[branch]'];
  
  // Clear UPI if bank is selected
  updateData.upiId = "";
} else if (paymentMethod === "upi") {
  // Clear bank details if UPI is selected
  updateData.bankDetail = {
    accountNumber: '',
    IFSC: '',
    accountHolderName: '',
    branch: '',
  };
  // UPI ID is already in updateData
}
```

## Request/Response Format

### Registration Request (Bank)
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "password": "password123",
  "paymentMethod": "bank",
  "bankDetail[accountNumber]": "1234567890",
  "bankDetail[IFSC]": "SBIN0001234",
  "bankDetail[accountHolderName]": "John Doe",
  "bankDetail[branch]": "State Bank of India"
}
```

### Registration Request (UPI)
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "password": "password123",
  "paymentMethod": "upi",
  "upiId": "9876543210@paytm"
}
```

### Database Document (Bank)
```json
{
  "_id": "...",
  "name": "John Doe",
  "phone": "9876543210",
  "paymentMethod": "bank",
  "bankDetail": {
    "accountNumber": "1234567890",
    "IFSC": "SBIN0001234",
    "accountHolderName": "John Doe",
    "branch": "State Bank of India"
  },
  "upiId": ""
}
```

### Database Document (UPI)
```json
{
  "_id": "...",
  "name": "John Doe",
  "phone": "9876543210",
  "paymentMethod": "upi",
  "bankDetail": {
    "accountNumber": "",
    "IFSC": "",
    "accountHolderName": "",
    "branch": ""
  },
  "upiId": "9876543210@paytm"
}
```

## Logic Flow

### Registration Flow:
1. Frontend sends `paymentMethod` field ("bank" or "upi")
2. If `paymentMethod === "bank"`:
   - Process bank details from flattened fields
   - Clear `upiId` field
3. If `paymentMethod === "upi"`:
   - Clear all bank detail fields
   - Save `upiId` value
4. Save vendor with appropriate payment details

### Update Flow:
1. Frontend sends `paymentMethod` field
2. Controller checks payment method
3. If switching from bank to UPI:
   - Clear bank details
   - Save UPI ID
4. If switching from UPI to bank:
   - Clear UPI ID
   - Save bank details

## Data Validation

### Model Level:
- `paymentMethod`: Must be "bank" or "upi"
- `upiId`: Optional string, trimmed
- `bankDetail`: Optional nested object

### Controller Level:
- Sanitizes all input values
- Handles flattened field names (e.g., `bankDetail[accountNumber]`)
- Clears opposite payment method fields when switching

## Benefits

1. ✅ **Flexible Payment Options** - Vendors can choose bank or UPI
2. ✅ **Data Integrity** - Only one payment method active at a time
3. ✅ **Backward Compatible** - Existing vendors with bank details continue to work
4. ✅ **Clean Data** - Unused fields are cleared when switching methods
5. ✅ **Easy Migration** - Vendors can switch between methods anytime

## Testing Scenarios

### Test Case 1: New Vendor with Bank Details
```bash
POST /api/vendor/register
{
  "paymentMethod": "bank",
  "bankDetail[accountNumber]": "1234567890",
  "bankDetail[IFSC]": "SBIN0001234",
  ...
}
```
**Expected:** Vendor created with bank details, `upiId` is empty

### Test Case 2: New Vendor with UPI
```bash
POST /api/vendor/register
{
  "paymentMethod": "upi",
  "upiId": "9876543210@paytm",
  ...
}
```
**Expected:** Vendor created with UPI ID, bank details are empty

### Test Case 3: Update from Bank to UPI
```bash
PUT /api/vendor/update/:id
{
  "paymentMethod": "upi",
  "upiId": "9876543210@paytm"
}
```
**Expected:** Bank details cleared, UPI ID saved

### Test Case 4: Update from UPI to Bank
```bash
PUT /api/vendor/update/:id
{
  "paymentMethod": "bank",
  "bankDetail[accountNumber]": "1234567890",
  ...
}
```
**Expected:** UPI ID cleared, bank details saved

## Migration Notes

### For Existing Vendors:
- Existing vendors without `paymentMethod` field will default to "bank"
- Existing bank details remain intact
- No data migration required

### Database Migration (Optional):
If you want to set `paymentMethod` for existing vendors:
```javascript
// Run this in MongoDB shell or migration script
db.vendors.updateMany(
  { paymentMethod: { $exists: false } },
  { $set: { paymentMethod: "bank", upiId: "" } }
);
```

## Future Enhancements

1. **UPI Verification** - Verify UPI ID before saving
2. **Multiple Payment Methods** - Allow both bank and UPI simultaneously
3. **Payment History** - Track which method was used for each payment
4. **UPI QR Code** - Generate QR code for UPI payments
5. **Validation** - Add regex validation for UPI ID format

## Notes

- Default payment method is "bank" for backward compatibility
- UPI ID is stored as plain text (consider encryption for production)
- Bank details and UPI ID are mutually exclusive
- Frontend should handle switching between methods gracefully
