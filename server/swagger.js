const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const fs = require('fs');

const doc = {
    info: {
        title: 'Mera Ghar Sansar API Docs',
        version: '1.0.0',
        description: 'Auto-generated API documentation',
        contact: { name: 'API Support' },
    },
    servers: [
        { url: 'http://localhost:8000', description: 'Development Server' },
        { url: 'https://your-production-url.com', description: 'Production Server' },
    ],

    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            // ── Auth ──────────────────────────────────────────────────────────
            AuthRegister: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    phone: { type: 'string', example: '9876543210' },
                    password: { type: 'string', example: 'Strong@123' },
                },
            },
            AuthLogin: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'Strong@123' },
                },
            },
            ChangePassword: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: { type: 'string', example: 'OldPass@1' },
                    newPassword: { type: 'string', example: 'NewPass@2' },
                },
            },

            // ── Vendor ───────────────────────────────────────────────────────
            VendorCreate: {
                type: 'object',
                required: ['name', 'email', 'phone', 'businessName'],
                properties: {
                    name: { type: 'string', example: 'Jane Smith' },
                    email: { type: 'string', example: 'jane@vendor.com' },
                    phone: { type: 'string', example: '9876543210' },
                    businessName: { type: 'string', example: 'Jane\'s Events' },
                },
            },
            VendorUpdate: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    businessName: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                },
            },
            VendorProfileUpdateRequest: {
                type: 'object',
                properties: {
                    requestedChanges: { type: 'object', description: 'Fields the vendor wishes to update' },
                    reason: { type: 'string', example: 'Updated business address' },
                },
            },

            // ── Property ─────────────────────────────────────────────────────
            PropertyCreate: {
                type: 'object',
                required: ['title', 'description', 'category', 'pricing', 'location'],
                properties: {
                    title: { type: 'string', example: 'Luxury Banquet Hall' },
                    description: { type: 'string' },
                    category: { type: 'string', example: '65f0c1...' },
                    pricing: { type: 'object' },
                    location: {
                        type: 'object',
                        properties: {
                            address: { type: 'string' },
                            city: { type: 'string' },
                            state: { type: 'string' },
                            pincode: { type: 'string' },
                        },
                    },
                    amenities: { type: 'object' },
                    images: { type: 'array', items: { type: 'string' } },
                },
            },
            PropertyUpdate: { $ref: '#/components/schemas/PropertyCreate' },

            // ── Booking ───────────────────────────────────────────────────────
            BookingCreate: {
                type: 'object',
                required: ['property', 'bookingDate', 'startTime', 'endTime', 'bookingType', 'amount'],
                properties: {
                    property: { type: 'string', example: '65f0c1...' },
                    bookingDate: { type: 'string', format: 'date', example: '2026-05-20' },
                    startTime: { type: 'string', example: '10:00 AM' },
                    endTime: { type: 'string', example: '02:00 PM' },
                    bookingType: { type: 'string', enum: ['hourly', 'halfday', 'fullday'] },
                    amount: { type: 'number', example: 11800 },
                    couponCode: { type: 'string', example: 'SAVE10' },
                    customerDetails: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
                            eventType: { type: 'string' },
                            guestCount: { type: 'number' },
                            specialRequirements: { type: 'string' },
                        },
                    },
                    priceBreakdown: {
                        type: 'object',
                        properties: {
                            basePrice: { type: 'number' },
                            discount: { type: 'number' },
                            gst: { type: 'number' },
                            platformFee: { type: 'number' },
                            total: { type: 'number' },
                        },
                    },
                },
            },
            BookingUpdateStatus: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
                },
            },
            BookingCancel: {
                type: 'object',
                properties: { reason: { type: 'string' } },
            },

            // ── Blog ─────────────────────────────────────────────────────────
            BlogCreate: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                    title: { type: 'string', example: 'Top 10 Venues in 2026' },
                    content: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    coverImage: { type: 'string' },
                    published: { type: 'boolean', example: false },
                },
            },
            BlogUpdate: { $ref: '#/components/schemas/BlogCreate' },

            // ── Coupon ───────────────────────────────────────────────────────
            CouponCreate: {
                type: 'object',
                required: ['code', 'discountType', 'discountValue'],
                properties: {
                    code: { type: 'string', example: 'SAVE10' },
                    discountType: { type: 'string', enum: ['percentage', 'fixed'] },
                    discountValue: { type: 'number', example: 10 },
                    minOrderValue: { type: 'number', example: 500 },
                    maxUses: { type: 'number', example: 100 },
                    expiresAt: { type: 'string', format: 'date', example: '2026-12-31' },
                    isActive: { type: 'boolean', example: true },
                },
            },
            CouponUpdate: { $ref: '#/components/schemas/CouponCreate' },
            CouponValidate: {
                type: 'object',
                required: ['code', 'orderValue'],
                properties: {
                    code: { type: 'string', example: 'SAVE10' },
                    orderValue: { type: 'number', example: 1500 },
                },
            },

            // ── Category ─────────────────────────────────────────────────────
            CategoryCreate: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', example: 'Banquet Hall' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    isActive: { type: 'boolean', example: true },
                },
            },

            // ── Ads ───────────────────────────────────────────────────────────
            AdsCreate: {
                type: 'object',
                required: ['title', 'image', 'targetUrl'],
                properties: {
                    title: { type: 'string', example: 'Summer Sale' },
                    image: { type: 'string' },
                    targetUrl: { type: 'string', example: 'https://example.com' },
                    position: { type: 'string', enum: ['hero', 'sidebar', 'banner'] },
                    isActive: { type: 'boolean', example: true },
                },
            },

            // ── Job / Career ─────────────────────────────────────────────────
            JobCreate: {
                type: 'object',
                required: ['title', 'description', 'location'],
                properties: {
                    title: { type: 'string', example: 'Software Engineer' },
                    description: { type: 'string' },
                    location: { type: 'string', example: 'Remote' },
                    type: { type: 'string', enum: ['full-time', 'part-time', 'contract'] },
                    isActive: { type: 'boolean', example: true },
                },
            },
            CareerApply: {
                type: 'object',
                required: ['jobId', 'name', 'email', 'resume'],
                properties: {
                    jobId: { type: 'string', example: '65f0c1...' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    phone: { type: 'string', example: '9876543210' },
                    resume: { type: 'string', description: 'URL or base64 of resume' },
                    coverLetter: { type: 'string' },
                },
            },

            // ── Rating & Review ───────────────────────────────────────────────
            RatingCreate: {
                type: 'object',
                required: ['property', 'rating'],
                properties: {
                    property: { type: 'string', example: '65f0c1...' },
                    rating: { type: 'number', example: 4, minimum: 1, maximum: 5 },
                    review: { type: 'string', example: 'Great venue!' },
                },
            },

            // ── Contact ───────────────────────────────────────────────────────
            ContactCreate: {
                type: 'object',
                required: ['name', 'email', 'message'],
                properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    phone: { type: 'string', example: '9876543210' },
                    message: { type: 'string', example: 'I need a venue for 200 guests' },
                },
            },

            // ── Customer Support ──────────────────────────────────────────────
            SupportTicketCreate: {
                type: 'object',
                required: ['subject', 'message'],
                properties: {
                    subject: { type: 'string', example: 'Payment not received' },
                    message: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    category: { type: 'string', example: 'Billing' },
                },
            },

            // ── Price Key Features ────────────────────────────────────────────
            PriceKeyFeaturesCreate: {
                type: 'object',
                required: ['planName', 'price', 'features'],
                properties: {
                    planName: { type: 'string', example: 'Premium' },
                    price: { type: 'number', example: 4999 },
                    features: { type: 'array', items: { type: 'string' } },
                    isActive: { type: 'boolean', example: true },
                },
            },

            // ── Razorpay ─────────────────────────────────────────────────────
            RazorpayOrderCreate: {
                type: 'object',
                required: ['amount', 'currency'],
                properties: {
                    amount: { type: 'number', example: 11800, description: 'Amount in paise' },
                    currency: { type: 'string', example: 'INR' },
                    bookingId: { type: 'string', example: '65f0c1...' },
                },
            },
            RazorpayVerify: {
                type: 'object',
                required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
                properties: {
                    razorpay_order_id: { type: 'string' },
                    razorpay_payment_id: { type: 'string' },
                    razorpay_signature: { type: 'string' },
                },
            },

            // ── Image Upload ─────────────────────────────────────────────────
            UploadBase64: {
                type: 'object',
                required: ['file'],
                properties: {
                    file: { type: 'string', description: 'Base64 encoded data URL' },
                    folder: { type: 'string', example: 'documents' },
                },
            },

            // ── Service Update Request ────────────────────────────────────────
            ServiceUpdateRequest: {
                type: 'object',
                properties: {
                    serviceId: { type: 'string', example: '65f0c1...' },
                    requestedChanges: { type: 'object' },
                    reason: { type: 'string' },
                },
            },
        },
    },

    security: [{ bearerAuth: [] }],

    tags: [
        { name: 'Auth', description: 'Authentication & registration' },
        { name: 'Vendor', description: 'Vendor management' },
        { name: 'VendorProfileUpdateRequest', description: 'Vendor profile change requests' },
        { name: 'Property', description: 'Property / listing management' },
        { name: 'Booking', description: 'Booking management' },
        { name: 'Blog', description: 'Blog posts' },
        { name: 'Coupon', description: 'Coupon / discount codes' },
        { name: 'Category', description: 'Property categories' },
        { name: 'Ads', description: 'Advertisement management' },
        { name: 'Job', description: 'Job listings' },
        { name: 'Career', description: 'Job applications' },
        { name: 'Rating', description: 'Ratings & reviews' },
        { name: 'Contact', description: 'Contact form submissions' },
        { name: 'CustomerSupport', description: 'Support tickets' },
        { name: 'Dashboard', description: 'Dashboard analytics' },
        { name: 'PriceKeyFeatures', description: 'Pricing plans & key features' },
        { name: 'Razorpay', description: 'Payment gateway (Razorpay)' },
        { name: 'Audit', description: 'Audit logs' },
        { name: 'CommunicationLogs', description: 'Communication logs' },
        { name: 'SearchLogs', description: 'Search logs' },
        { name: 'ServiceUpdateRequest', description: 'Service update requests' },
        { name: 'Image', description: 'Image uploads' },
    ],
};

// ─── Prefix → Tag (longest first to avoid partial matches) ───────────────────
const TAG_MAP = [
    { prefix: '/api/v1/vendor-profile-update-request', tag: 'VendorProfileUpdateRequest' },
    { prefix: '/api/v1/vendor', tag: 'Vendor' },
    { prefix: '/api/v1/service-update-request', tag: 'ServiceUpdateRequest' },
    { prefix: '/api/v1/price-key-features', tag: 'PriceKeyFeatures' },
    { prefix: '/api/v1/customer-support', tag: 'CustomerSupport' },
    { prefix: '/api/v1/communication-logs', tag: 'CommunicationLogs' },
    { prefix: '/api/v1/search-logs', tag: 'SearchLogs' },
    { prefix: '/api/v1/razorpay', tag: 'Razorpay' },
    { prefix: '/api/v1/property', tag: 'Property' },
    { prefix: '/api/v1/booking', tag: 'Booking' },
    { prefix: '/api/v1/category', tag: 'Category' },
    { prefix: '/api/v1/contact', tag: 'Contact' },
    { prefix: '/api/v1/career', tag: 'Career' },
    { prefix: '/api/v1/rating', tag: 'Rating' },
    { prefix: '/api/v1/coupon', tag: 'Coupon' },
    { prefix: '/api/v1/audit', tag: 'Audit' },
    { prefix: '/api/v1/image', tag: 'Image' },
    { prefix: '/api/v1/blog', tag: 'Blog' },
    { prefix: '/api/v1/auth', tag: 'Auth' },
    { prefix: '/api/v1/ads', tag: 'Ads' },
    { prefix: '/api/v1/job', tag: 'Job' },
    { prefix: '/api/v1/dashboard', tag: 'Dashboard' },
];

function assignTagsFromPaths(outputFile) {
    const spec = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

    for (const [routePath, methods] of Object.entries(spec.paths || {})) {
        const match = TAG_MAP.find(({ prefix }) => routePath.startsWith(prefix));
        if (!match) continue;

        for (const operation of Object.values(methods)) {
            if (typeof operation !== 'object' || Array.isArray(operation)) continue;
            operation.tags = [match.tag];
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
    console.log('🏷️   Tags auto-assigned from URL prefixes');
}

function augmentSpec(outputFile) {
    const spec = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

    // ── Public endpoints (no auth required) ──────────────────────────────────
    const publicEndpoints = new Set([
        'post /api/v1/auth/register',
        'post /api/v1/auth/login',
        'get /api/v1/property',
        'get /api/v1/property/:id',
        'get /api/v1/category',
        'get /api/v1/blog',
        'get /api/v1/blog/:id',
        'get /api/v1/contact',
        'get /api/v1/job',
        'get /api/v1/job/:id',
        'post /api/v1/contact',
        'post /api/v1/career',
        'get /api/v1/ads',
        'get /api/v1/price-key-features',
        'get /',
    ]);

    // ── Operation summaries + request body references ─────────────────────────
    const opMap = {
        // Auth
        'post /api/v1/auth/register': { summary: 'Register new user', requestBody: { $ref: '#/components/schemas/AuthRegister' } },
        'post /api/v1/auth/login': { summary: 'Login user', requestBody: { $ref: '#/components/schemas/AuthLogin' } },
        'put /api/v1/auth/change-password': { summary: 'Change password', requestBody: { $ref: '#/components/schemas/ChangePassword' } },

        // Vendor
        'post /api/v1/vendor': { summary: 'Create vendor', requestBody: { $ref: '#/components/schemas/VendorCreate' } },
        'put /api/v1/vendor/{id}': { summary: 'Update vendor', requestBody: { $ref: '#/components/schemas/VendorUpdate' } },

        // Vendor profile update request
        'post /api/v1/vendor-profile-update-request': { summary: 'Submit profile update request', requestBody: { $ref: '#/components/schemas/VendorProfileUpdateRequest' } },

        // Property
        'post /api/v1/property': { summary: 'Create property', requestBody: { $ref: '#/components/schemas/PropertyCreate' } },
        'put /api/v1/property/{id}': { summary: 'Update property', requestBody: { $ref: '#/components/schemas/PropertyUpdate' } },

        // Booking
        'post /api/v1/booking': { summary: 'Create booking', requestBody: { $ref: '#/components/schemas/BookingCreate' } },
        'put /api/v1/booking/{id}/status': { summary: 'Update booking status', requestBody: { $ref: '#/components/schemas/BookingUpdateStatus' } },
        'put /api/v1/booking/{id}/cancel': { summary: 'Cancel booking', requestBody: { $ref: '#/components/schemas/BookingCancel' } },

        // Blog
        'post /api/v1/blog': { summary: 'Create blog post', requestBody: { $ref: '#/components/schemas/BlogCreate' } },
        'put /api/v1/blog/{id}': { summary: 'Update blog post', requestBody: { $ref: '#/components/schemas/BlogUpdate' } },

        // Coupon
        'post /api/v1/coupon': { summary: 'Create coupon', requestBody: { $ref: '#/components/schemas/CouponCreate' } },
        'put /api/v1/coupon/{id}': { summary: 'Update coupon', requestBody: { $ref: '#/components/schemas/CouponUpdate' } },
        'post /api/v1/coupon/validate': { summary: 'Validate coupon', requestBody: { $ref: '#/components/schemas/CouponValidate' } },

        // Category
        'post /api/v1/category': { summary: 'Create category', requestBody: { $ref: '#/components/schemas/CategoryCreate' } },
        'put /api/v1/category/{id}': { summary: 'Update category', requestBody: { $ref: '#/components/schemas/CategoryCreate' } },

        // Ads
        'post /api/v1/ads': { summary: 'Create ad', requestBody: { $ref: '#/components/schemas/AdsCreate' } },
        'put /api/v1/ads/{id}': { summary: 'Update ad', requestBody: { $ref: '#/components/schemas/AdsCreate' } },

        // Job
        'post /api/v1/job': { summary: 'Create job listing', requestBody: { $ref: '#/components/schemas/JobCreate' } },
        'put /api/v1/job/{id}': { summary: 'Update job listing', requestBody: { $ref: '#/components/schemas/JobCreate' } },

        // Career
        'post /api/v1/career': { summary: 'Apply for a job', requestBody: { $ref: '#/components/schemas/CareerApply' } },

        // Rating
        'post /api/v1/rating': { summary: 'Submit rating & review', requestBody: { $ref: '#/components/schemas/RatingCreate' } },

        // Contact
        'post /api/v1/contact': { summary: 'Submit contact form', requestBody: { $ref: '#/components/schemas/ContactCreate' } },

        // Customer support
        'post /api/v1/customer-support': { summary: 'Create support ticket', requestBody: { $ref: '#/components/schemas/SupportTicketCreate' } },

        // Price key features
        'post /api/v1/price-key-features': { summary: 'Create pricing plan', requestBody: { $ref: '#/components/schemas/PriceKeyFeaturesCreate' } },
        'put /api/v1/price-key-features/{id}': { summary: 'Update pricing plan', requestBody: { $ref: '#/components/schemas/PriceKeyFeaturesCreate' } },

        // Razorpay
        'post /api/v1/razorpay/order': { summary: 'Create Razorpay order', requestBody: { $ref: '#/components/schemas/RazorpayOrderCreate' } },
        'post /api/v1/razorpay/verify': { summary: 'Verify Razorpay payment', requestBody: { $ref: '#/components/schemas/RazorpayVerify' } },

        // Service update request
        'post /api/v1/service-update-request': { summary: 'Submit service update request', requestBody: { $ref: '#/components/schemas/ServiceUpdateRequest' } },

        // Image (multipart)
        'post /api/v1/image': { summary: 'Upload image (multipart)', multipart: true },
        'post /api/v1/image/base64': { summary: 'Upload image (base64)', requestBody: { $ref: '#/components/schemas/UploadBase64' } },
    };

    for (const [path, methods] of Object.entries(spec.paths || {})) {
        for (const [method, operation] of Object.entries(methods)) {
            if (typeof operation !== 'object' || Array.isArray(operation)) continue;
            const key = `${method.toLowerCase()} ${path}`;

            // Remove security for public endpoints
            if (publicEndpoints.has(key)) {
                operation.security = [];
            }

            // Apply summary and request body
            const conf = opMap[key];
            if (conf) {
                if (conf.summary) operation.summary = conf.summary;

                if (conf.requestBody) {
                    operation.requestBody = {
                        required: true,
                        content: {
                            'application/json': {
                                schema: conf.requestBody,
                            },
                        },
                    };
                }

                if (conf.multipart) {
                    operation.requestBody = {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: { type: 'string', format: 'binary' },
                                        folder: { type: 'string' },
                                    },
                                },
                            },
                        },
                    };
                }
            }
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
    console.log('🧩  Spec augmented with summaries, request bodies and security rules');
}

// ─────────────────────────────────────────────────────────────────────────────

const outputFile = './swagger-output.json';
const routes = ['./index.js'];          // ← updated to match your entry file

swaggerAutogen(outputFile, routes, doc).then(() => {
    assignTagsFromPaths(outputFile);
    augmentSpec(outputFile);
    console.log('✅  swagger-output.json generated successfully');
});