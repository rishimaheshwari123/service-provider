# Search Logs Implementation - Complete

## Overview
Implemented a comprehensive search logging system that tracks all searches made on both the Home page and Services page. Admin can view, filter, and download search logs in Excel format.

## Features
- Track searches from Home page and Services page
- Capture search query, category, location, page, results count
- Admin dashboard with filters and statistics
- Excel download functionality
- IP address and user agent tracking
- Top searches and category analytics

## Backend Implementation

### 1. Database Model (`server/models/searchLogs.js`)
```javascript
{
  searchQuery: String (required),
  category: String (default: "All Categories"),
  location: String (default: "Unknown"),
  page: String (enum: ["Home", "Services"]),
  userId: ObjectId (ref: "auth"),
  vendorId: ObjectId (ref: "Vendor"),
  ipAddress: String,
  userAgent: String,
  resultsCount: Number (default: 0),
  timestamps: true
}
```

### 2. Controller (`server/controllers/searchLogsCtrl.js`)
- `createSearchLog` - Create new search log (public endpoint)
- `getAllSearchLogs` - Get all logs with filters and pagination
- `getSearchStats` - Get analytics (top searches, categories, page stats)
- `downloadSearchLogs` - Download logs as Excel file

### 3. Routes (`server/routes/searchLogsRoute.js`)
- `POST /api/v1/search-logs/create` - Create log (public)
- `GET /api/v1/search-logs` - Get all logs
- `GET /api/v1/search-logs/stats` - Get statistics
- `GET /api/v1/search-logs/download` - Download Excel

### 4. Server Integration (`server/index.js`)
Added route: `app.use("/api/v1/search-logs", require("./routes/searchLogsRoute"))`

## Frontend Implementation

### 1. API Configuration (`src/service/apis.js`)
```javascript
export const searchLogs = {
  CREATE_LOG_API: BASE_URL + "/search-logs/create",
  GET_ALL_LOGS_API: BASE_URL + "/search-logs",
  GET_STATS_API: BASE_URL + "/search-logs/stats",
  DOWNLOAD_LOGS_API: BASE_URL + "/search-logs/download",
}
```

### 2. Search Logger Utility (`src/utils/searchLogger.ts`)
Helper function to log searches from any component:
```typescript
logSearch({
  searchQuery: string,
  category?: string,
  location?: string,
  page: "Home" | "Services",
  resultsCount?: number
})
```

### 3. Home Page Integration (`src/pages/Top.tsx`)
- Added search logging when user clicks "Find Services"
- Logs: search query, category, location, page="Home"

### 4. Services Page Integration (`src/pages/ServicePage.tsx`)
- Added "Find Services" button next to search input (like Home page)
- Added search logging in `applyFilters` function with `shouldLog` parameter
- Logs only when user clicks "Find Services" button or presses Enter
- Logs: search query, category, page="Services", results count
- Prevents multiple logs on every keystroke

### 5. Admin Dashboard (`src/components/pages/admin/SearchLogs.tsx`)
Features:
- Statistics cards (Total Searches, Unique Searches, Avg Results, Home Page count)
- Filters: Search query, Category, Page, Date range
- Logs table with: Date/Time, Query, Category, Location, Page, Results, IP
- Pagination
- Excel download button

### 6. Routing (`src/App.tsx`)
- Added route: `/admin/search-logs`
- Imported SearchLogs component

### 7. Admin Sidebar (`src/components/pages/admin/Sidebar.tsx`)
- Added "Search Logs" menu item with Search icon
- Purple color theme

## Data Captured

### For Each Search:
1. **Search Query** - What the user searched for
2. **Category** - Selected category or "All Categories"
3. **Location** - Location/search term (Home page) or "Unknown"
4. **Page** - "Home" or "Services"
5. **Results Count** - Number of results found (Services page only)
6. **IP Address** - User's IP address
7. **User Agent** - Browser/device information
8. **User/Vendor ID** - If logged in (optional)
9. **Timestamp** - When the search was performed

## Admin Dashboard Features

### Statistics:
- Total number of searches
- Unique search queries count
- Average results per search
- Home page vs Services page breakdown

### Filters:
- Search by query text
- Filter by category
- Filter by page (Home/Services)
- Date range filter

### Analytics:
- Top 10 search queries
- Top 10 categories searched
- Page-wise statistics

### Export:
- Download all logs as Excel file
- Includes all fields: Date, Query, Category, Location, Page, Results, User info, IP

## Usage

### For Users:
Searches are automatically logged when:
1. User clicks "Find Services" on home page
2. User types and searches on services page

### For Admin:
1. Navigate to `/admin/search-logs`
2. View statistics and logs
3. Apply filters to narrow down results
4. Click "Download Excel" to export data

## Testing
1. Go to home page and search for something
2. Go to services page and search
3. Login as admin and visit `/admin/search-logs`
4. Verify logs are created with correct data
5. Test filters and Excel download

## Benefits
- Understand user search behavior
- Identify popular search terms
- Optimize categories based on searches
- Track search effectiveness (results count)
- Improve SEO and content strategy
- Analyze user engagement patterns
