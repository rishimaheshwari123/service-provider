# Communication Logs System - Complete Setup

## ✅ What's Done

### 1. Database Model
**File:** `server/models/communicationLogs.js`

Tracks all SMS, WhatsApp, and Email communications with:
- Type (SMS/WhatsApp/Email)
- Purpose (OTP/Welcome/Approval/etc.)
- Recipient details
- Message content
- Status (Success/Failed/Pending)
- Cost tracking
- Error messages
- Timestamps

### 2. Logger Utility
**File:** `server/utils/communicationLogger.js`

Helper functions:
- `logSMS()` - Log SMS messages
- `logWhatsApp()` - Log WhatsApp messages
- `logEmail()` - Log Email messages

### 3. Updated OTP Service
**File:** `server/utils/otpService.js`

Added logging to:
- `sendSMSOTP()` - Logs every SMS OTP sent
- All other functions need similar updates

### 4. API Controller
**File:** `server/controllers/communicationLogsCtrl.js`

Endpoints:
- Get all logs with filters
- Get statistics
- Download Excel report

### 5. Routes
**File:** `server/routes/communicationLogsRoute.js`

- `GET /api/v1/communication-logs` - Get all logs
- `GET /api/v1/communication-logs/stats` - Get statistics
- `GET /api/v1/communication-logs/download` - Download Excel

---

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
cd server
npm install
```

This will install:
- `exceljs` - For Excel export
- `compression` - Already added

### 2. Restart Server
```bash
npm run dev
```

---

## 📊 API Usage

### Get All Logs
```http
GET /api/v1/communication-logs?type=SMS&status=Success&page=1&limit=50
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `type` - SMS, WhatsApp, Email
- `purpose` - OTP, Welcome, Approval, etc.
- `status` - Success, Failed, Pending
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "logs": [...],
  "pagination": {
    "total": 1000,
    "page": 1,
    "pages": 20,
    "limit": 50
  }
}
```

### Get Statistics
```http
GET /api/v1/communication-logs/stats?startDate=2026-01-01&endDate=2026-02-28
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "byType": [
      {
        "_id": "SMS",
        "totalCount": 500,
        "totalCost": 125,
        "statuses": [
          { "status": "Success", "count": 480, "totalCost": 120 },
          { "status": "Failed", "count": 20, "totalCost": 5 }
        ]
      }
    ],
    "byPurpose": [
      { "_id": "OTP", "count": 300, "totalCost": 75 },
      { "_id": "Welcome", "count": 200, "totalCost": 50 }
    ],
    "overall": {
      "totalMessages": 1000,
      "totalCost": 250,
      "successCount": 950,
      "failedCount": 50
    }
  }
}
```

### Download Excel Report
```http
GET /api/v1/communication-logs/download?type=SMS&startDate=2026-02-01
Authorization: Bearer <admin_token>
```

Downloads Excel file with all logs.

---

## 🎯 Next Steps - Add Logging to All Functions

### Update Welcome SMS Functions

**File:** `server/utils/otpService.js`

Add logging to:
1. `sendWelcomeSMS1()`
2. `sendWelcomeSMS2()`
3. `sendApprovalSMS()`
4. `sendApprovalWhatsApp()`
5. `sendWhatsAppWelcome()`
6. `sendWhatsAppOTP()`

**Example Pattern:**
```javascript
// At the end of successful send
await logSMS({
    phone: phoneNumber,
    name: vendorName,
    message: smsText,
    purpose: "Welcome", // or "Approval", etc.
    status: "Success",
    response: response.data,
    vendorId,
});

// At the end of failed send
await logSMS({
    phone: phoneNumber,
    name: vendorName,
    message: smsText,
    purpose: "Welcome",
    status: "Failed",
    errorMessage: error.message,
    vendorId,
});
```

### Update Email Service

**File:** `server/utils/emailService.js` (if exists)

Add logging using `logEmail()` function.

---

## 📱 Frontend Integration (Admin Dashboard)

### Create Communication Logs Page

**File:** `src/pages/admin/CommunicationLogs.tsx`

Features needed:
1. Table with filters (type, status, date range)
2. Statistics cards (total sent, success rate, cost)
3. Download Excel button
4. Pagination
5. Search by phone/email

### API Service

**File:** `src/service/operations/communicationLogs.js`

```javascript
export const getCommunicationLogs = async (filters) => {
  const response = await apiConnector("GET", "/communication-logs", null, {
    params: filters
  });
  return response.data;
};

export const getCommStats = async (filters) => {
  const response = await apiConnector("GET", "/communication-logs/stats", null, {
    params: filters
  });
  return response.data;
};

export const downloadCommLogs = async (filters) => {
  const response = await apiConnector("GET", "/communication-logs/download", null, {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};
```

---

## 📈 Dashboard Metrics to Show

1. **Today's Stats**
   - Total messages sent
   - Success rate
   - Total cost

2. **By Type**
   - SMS count & cost
   - WhatsApp count & cost
   - Email count & cost

3. **By Purpose**
   - OTP messages
   - Welcome messages
   - Approval messages

4. **Trends**
   - Daily/Weekly/Monthly charts
   - Success vs Failed ratio
   - Cost trends

---

## 🔍 Sample Queries

### Get today's SMS logs
```javascript
const today = new Date().toISOString().split('T')[0];
GET /api/v1/communication-logs?type=SMS&startDate=${today}
```

### Get failed messages
```javascript
GET /api/v1/communication-logs?status=Failed
```

### Get OTP messages for a vendor
```javascript
GET /api/v1/communication-logs?purpose=OTP&vendorId=<vendor_id>
```

---

## 💰 Cost Tracking

Current costs (approximate):
- SMS: ₹0.25 per message
- WhatsApp: ₹0.10 per message
- Email: ₹0.00 (free)

These are set in `communicationLogger.js` and can be updated.

---

## 🎨 Excel Report Format

Columns:
1. Date & Time
2. Type (SMS/WhatsApp/Email)
3. Purpose
4. Recipient Name
5. Phone
6. Email
7. Message
8. Status
9. Provider
10. Cost (₹)
11. Error Message

---

## ✅ Testing

### 1. Send a test OTP
```bash
# This will automatically log the communication
POST /api/v1/vendor/register
```

### 2. Check logs
```bash
GET /api/v1/communication-logs
```

### 3. Download report
```bash
GET /api/v1/communication-logs/download
```

---

## 🚀 Deployment Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Restart server
- [ ] Test logging with OTP send
- [ ] Verify logs in database
- [ ] Test Excel download
- [ ] Add logging to remaining functions
- [ ] Create admin frontend page
- [ ] Test filters and pagination
- [ ] Monitor costs

---

**Status:** ✅ Backend Complete - Frontend Pending
**Next:** Add logging to all remaining SMS/WhatsApp functions
