# Automatic Property/Service Creation System

## Overview
This system automatically creates a property/service entry based on payment method and approval status when a vendor purchases a category.

## Updated Logic

### 1. Service Creation Rules

#### **Online Payments (Prepaid/Razorpay)**
- ✅ **Create service immediately** when payment is successful
- Status: `purchased`
- Property: Created automatically

#### **Cash/QR Payments**
- ❌ **Don't create service initially**
- Status: `pending` (waiting for admin approval)
- Property: Not created until approved

#### **Admin Approval**
- ✅ **Create service when admin approves** cash/QR payments
- Status: `pending` → `purchased`
- Property: Created when approved

#### **Vendor Self-Registration**
- ✅ **Create service immediately** (isAdmin flag or assignedByAdmin)
- Status: `purchased`
- Property: Created automatically

### 2. Payment Method Behavior

| Payment Method | Initial Status | Service Created | When Service Created |
|---------------|---------------|-----------------|---------------------|
| `prepaid` | `purchased` | ✅ Immediately | On successful payment |
| `razorpay` | `purchased` | ✅ Immediately | On payment verification |
| `cash` | `pending` | ❌ No | When admin approves |
| `qr` | `pending` | ❌ No | When admin approves |
| Admin assigned | `purchased` | ✅ Immediately | On assignment |

### 3. Property Data Mapping
When a property is created, the following data mapping occurs:

| Property Field | Data Source | Fallback |
|---------------|-------------|----------|
| `title` | Category name | - |
| `price` | Category price | - |
| `location` | Vendor address → Vendor serviceLocation | "Location not specified" |
| `type` | Fixed value | "service" |
| `category` | Category name | - |
| `description` | Vendor description → Category autoFilled | Auto-generated text |
| `images` | Category image | Empty array |
| `vendor` | Vendor ID | - |
| `status` | Fixed value | "active" |

## Implementation Details

### Modified Controllers

#### 1. `categoryCtrl.js`
- **`purchaseCategoryCtrl`**: 
  - Creates property immediately for online payments (prepaid/razorpay)
  - Doesn't create property for cash/QR payments (waits for approval)
  - Creates property for admin assignments
- **`approvePurchaseCtrl`**: Creates property when admin approves pending purchases
- **`createPropertyForCategory`**: Helper function for property creation

#### 2. `paymentRazorpayCtrl.js`
- **`verifyPaymentCtrl`**: Creates property immediately after successful Razorpay payment verification
- **`createPropertyForCategory`**: Helper function for property creation

### Workflow Examples

#### **External Vendor with Online Payment**
1. Vendor registers externally
2. Purchases category with prepaid/Razorpay payment
3. ✅ **Service created immediately**
4. Status: `purchased`

#### **External Vendor with Cash Payment**
1. Vendor registers externally
2. Purchases category with cash payment
3. ❌ **No service created**
4. Status: `pending`
5. Admin approves → ✅ **Service created**
6. Status: `purchased`

#### **Vendor Self-Registration**
1. Vendor registers themselves (isAdmin flag)
2. Purchases any category
3. ✅ **Service created immediately**
4. Status: `purchased`

### API Endpoints

#### Purchase Category
```bash
POST /api/category/purchase
{
  "vendorId": "vendor_id",
  "categoryId": "category_id",
  "paymentMode": "prepaid|razorpay|cash|qr",
  "transactionId": "transaction_id",
  "isAdmin": false
}
```

#### Approve Purchase (Admin)
```bash
PUT /api/category/approve/:purchaseId
```
- Creates service when approving cash/QR payments

#### Razorpay Verification
```bash
POST /api/payment/verify
{
  "razorpay_payment_id": "pay_id",
  "razorpay_order_id": "order_id", 
  "razorpay_signature": "signature",
  "vendorId": "vendor_id",
  "categoryId": "category_id"
}
```
- Creates service immediately after verification

## Benefits
1. **Controlled Service Creation**: Services only created for confirmed payments
2. **Admin Control**: Cash/QR payments require admin approval before service creation
3. **Immediate Online Services**: Online payments get instant service listings
4. **Flexible Workflow**: Supports both external and self-registration scenarios