# Website Sitemap

## Public Pages (Accessible to all users)

### Main Navigation
- **/** - Homepage (Landing page)
- **/about** - About Us page
- **/contact** - Contact page
- **/services** - Services listing page
- **/categories** - Categories page
- **/blogs** - Blog listing page
- **/careers** - Careers/Jobs listing page
- **/customer-support** - Customer support page

### Legal Pages
- **/terms** - Terms and Conditions
- **/privacy-policy** - Privacy Policy

### Authentication Pages
- **/login** - User login
- **/signup** - User registration
- **/partner/login** - Vendor/Partner login
- **/vendor/register** - Vendor registration

### Dynamic Content Pages
- **/service/:id** - Individual service details (e.g., /service/123)
- **/blog/:id** - Individual blog post (e.g., /blog/456)
- **/careers/:id** - Individual job posting (e.g., /careers/789)

### User Features
- **/user/profile** - User profile page (authenticated users)
- **/category-purchase** - Category purchase page

## Admin Portal (Role: admin)
**Base Path:** `/admin`

### Admin Dashboard & Management
- **/admin/dashboard** - Admin dashboard
- **/admin/services** - Manage all services
- **/admin/vendors** - Vendor management
- **/admin/users** - User management
- **/admin/categories** - Category management
- **/admin/bookings** - All bookings management

### Content Management
- **/admin/add-blog** - Create new blog post
- **/admin/get-blog** - Manage existing blogs
- **/admin/ads** - Advertisement management

### Support & Communication
- **/admin/get-support** - Customer support tickets
- **/admin/communication-logs** - Communication logs
- **/admin/search-logs** - Search activity logs

### HR & Jobs
- **/admin/add-job** - Create job posting
- **/admin/get-jobs** - Manage job postings

### System Management
- **/admin/crm** - CRM and role management
- **/admin/logs** - System audit logs
- **/admin/add-service/:id** - Add service for specific vendor

## Vendor Portal (Role: vendor)
**Base Path:** `/vendor`

### Vendor Dashboard & Profile
- **/vendor/dashboard** - Vendor dashboard
- **/vendor/my-profile** - Vendor profile management

### Service Management
- **/vendor/services** - Add new services/properties
- **/vendor/get-services** - Manage existing services
- **/vendor/inquiry-services** - Service inquiries

### Business Operations
- **/vendor/bookings** - Vendor bookings
- **/vendor/tasks** - Task management
- **/vendor/working-hours** - Update working hours
- **/vendor/purchase-categories** - Purchase service categories

### Vendor Analytics
- **/vendor/logs** - Vendor audit logs

## API Endpoints (Backend)
**Base Path:** `/api/v1`

### Authentication & User Management
- **/api/v1/auth** - Authentication endpoints
- **/api/v1/vendor** - Vendor-specific endpoints

### Content & Media
- **/api/v1/image** - Image upload/management
- **/api/v1/blog** - Blog management
- **/api/v1/property** - Property/Service management

### Communication & Support
- **/api/v1/contact** - Contact form submissions
- **/api/v1/customer-support** - Customer support tickets
- **/api/v1/communication-logs** - Communication logging

### Business Operations
- **/api/v1/booking** - Booking management
- **/api/v1/category** - Category management
- **/api/v1/razorpay** - Payment processing
- **/api/v1/rating** - Rating and review system

### Jobs & Careers
- **/api/v1/job** - Job management (admin)
- **/api/v1/career** - Career applications

### Analytics & Monitoring
- **/api/v1/dashboard** - Dashboard data
- **/api/v1/audit** - Audit logs
- **/api/v1/search-logs** - Search activity logs
- **/api/v1/ads** - Advertisement management

## Error Pages
- ***** - 404 Not Found page (catch-all route)

## Notes
- Protected routes require authentication and specific user roles
- Dynamic routes use parameters (e.g., :id) for specific content
- API endpoints are RESTful and handle CRUD operations
- The application supports role-based access control (admin, vendor, user)