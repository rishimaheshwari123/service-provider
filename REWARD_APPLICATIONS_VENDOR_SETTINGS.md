# Reward Applications Page - Vendor Settings Implementation

## Overview
The **Reward Applications** page (`/admin/reward-applications`) has been updated to display all vendors with the ability for admin to configure reward point acceptance and discount settings.

## Changes Made

### 1. Frontend Changes (`src/components/pages/admin/RewardApplications.tsx`)

**Previous Functionality:**
- Displayed reward redemption history
- Showed statistics cards
- Listed redeem codes with status filters

**New Functionality:**
- Displays all vendors in a table format
- Shows vendor details (name, company, email, phone)
- Displays reward acceptance status
- Shows discount type (Flat ₹ or Percentage %)
- Shows discount percentage (for percentage type)
- Three dots menu (⋮) with "Edit Settings" option
- Comprehensive edit dialog for configuring vendor settings

### 2. Backend Changes

#### Model Update (`server/models/vendorRewardSettingsModel.js`)
Added new field:
```javascript
discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
}
```

#### Controller Update (`server/controllers/rewardCtrl.js`)
Updated `updateVendorRewardSettings` to handle `discountPercentage` field.

## Features

### Vendor Table Columns
1. **Vendor** - Name and company
2. **Contact** - Email and phone
3. **Accepts Rewards** - Yes/No badge
4. **Discount Type** - Flat (₹) or Percentage (%)
5. **Discount %** - Shows percentage value (only for percentage type)
6. **Status** - Active/Inactive badge
7. **Actions** - Three dots menu with Edit option

### Edit Dialog Features

Admin can configure:

1. **Accept Reward Points** (Toggle)
   - Enable/disable vendor's ability to accept reward points

2. **Discount Type** (Dropdown)
   - **Flat Amount (₹)**: 1 point = ₹1 discount
   - **Percentage (%)**: Points converted to percentage discount

3. **Discount Percentage** (Input - only for percentage type)
   - Set the percentage discount (0-100%)
   - Example: If set to 10%, customer gets 10% off

4. **Maximum Discount Amount** (Optional)
   - Cap the maximum discount in rupees
   - Set to 0 for no limit

5. **Minimum Order Value** (Optional)
   - Minimum order amount required to use reward points
   - Set to 0 for no minimum

6. **Active Status** (Toggle)
   - Enable/disable the reward settings for this vendor

### Example Scenarios

#### Scenario 1: Flat Discount
- Discount Type: Flat
- Customer has 100 points
- Discount: ₹100

#### Scenario 2: Percentage Discount
- Discount Type: Percentage
- Discount Percentage: 10%
- Customer order: ₹1000
- Discount: ₹100 (10% of ₹1000)

#### Scenario 3: Percentage with Max Cap
- Discount Type: Percentage
- Discount Percentage: 15%
- Max Discount: ₹200
- Customer order: ₹2000
- Calculated discount: ₹300 (15% of ₹2000)
- Actual discount: ₹200 (capped at max)

## How It Works

### Admin Flow:
1. Admin navigates to `/admin/reward-applications`
2. Sees all vendors in a table
3. Clicks three dots (⋮) on any vendor row
4. Selects "Edit Settings" from dropdown
5. Configures reward acceptance and discount settings
6. Saves the settings

### Vendor Flow:
1. Vendor receives customer redeem code
2. Applies code at `/vendor/apply-reward-code`
3. System checks vendor's reward settings
4. Applies discount based on admin configuration:
   - If **Flat**: Direct rupee discount
   - If **Percentage**: Percentage discount on order

### User Flow:
1. User earns reward points (referral/download)
2. Generates redeem code from profile
3. Shares code with vendor
4. Vendor applies code
5. User gets discount based on vendor's settings

## API Endpoints Used

- `GET /api/v1/reward/vendor-settings` - Fetch all vendors with settings
- `PUT /api/v1/reward/vendor-settings/:vendorId` - Update vendor settings

## Database Schema

```javascript
VendorRewardSettings {
  vendorId: ObjectId (ref: Vendor)
  acceptsRewardPoints: Boolean
  discountType: String (enum: ["percentage", "flat"])
  discountPercentage: Number (0-100)
  maxDiscountAmount: Number
  minOrderValue: Number
  isActive: Boolean
  updatedBy: ObjectId (ref: auth)
  timestamps: true
}
```

## UI Components Used

- Card, CardContent, CardHeader, CardTitle, CardDescription
- Button, Input, Label, Switch
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
- DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
- Badge

## Icons Used

- Store - Page header
- Search - Search input
- Settings - Edit dialog
- DollarSign - Flat discount type
- Percent - Percentage discount type
- MoreVertical - Three dots menu
- Edit - Edit action

## Benefits

1. **Centralized Management**: Admin can manage all vendor reward settings from one page
2. **Flexible Discount Options**: Support for both flat and percentage discounts
3. **Granular Control**: Set max discount caps and minimum order values
4. **Easy Configuration**: Simple UI with clear examples
5. **Real-time Updates**: Changes reflect immediately for vendors

## Testing Checklist

- [ ] All vendors display correctly
- [ ] Search functionality works
- [ ] Three dots menu opens
- [ ] Edit dialog opens with current settings
- [ ] Can toggle reward acceptance
- [ ] Can switch between flat and percentage
- [ ] Discount percentage field shows only for percentage type
- [ ] Can set max discount and min order value
- [ ] Can toggle active status
- [ ] Save button updates settings
- [ ] Changes reflect in vendor table
- [ ] Pagination works for multiple vendors

## Notes

- The page title remains "Reward Applications" but functionality changed to vendor settings management
- Previous redemption history functionality has been replaced
- All vendors are displayed by default, even if they don't have settings configured yet
- Settings are created on first edit if they don't exist
