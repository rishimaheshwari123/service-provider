

// export const BASE_URL = "https://api.meragharsansaar.com/api/v1"
export const BASE_URL = "https://service-provider-1-6ite.onrender.com/api/v1"
// export const BASE_URL = "http://localhost:8000/api/v1"
// const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const endpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API_API: BASE_URL + "/auth/register",
  GET_ALL_USER_API: BASE_URL + "/auth/getAll",
  MY_PROFILE: BASE_URL + "/auth/my-profile",
  CHANGE_USER_TYPE: BASE_URL + "/auth/change-type",
  EDIT_USER_PERMISSION_API: BASE_URL + "/auth/update",
  DELETE_USER: BASE_URL + "/auth/delete",
  FORGOT_PASSWORD_API: BASE_URL + "/auth/forgot-password",
  VERIFY_RESET_OTP_API: BASE_URL + "/auth/verify-reset-otp",
  RESET_PASSWORD_API: BASE_URL + "/auth/reset-password",
  ADMIN_RESET_USER_PASSWORD_API: BASE_URL + "/auth/admin-reset-password",
  SEND_PHONE_VERIFICATION_OTP_API: BASE_URL + "/auth/send-phone-verification-otp",
  VERIFY_PHONE_OTP_API: BASE_URL + "/auth/verify-phone-otp",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/change-password",
  GENERATE_REFERRAL_CODE_API: BASE_URL + "/auth/generate-referral-code",
}

export const image = {
  IMAGE_UPLOAD: BASE_URL + "/image/multi",
}
export const vendor = {
  LOGIN_API: BASE_URL + "/vendor/login",
  SIGNUP_API: BASE_URL + "/vendor/register",
  SEND_OTP_API: BASE_URL + "/vendor/send-otp",
  VERIFY_OTP_API: BASE_URL + "/vendor/verify-otp",
  GET_ALL_VENDOR: BASE_URL + "/vendor/getAll",
  GET_ALL_VENDOR_PAGINATED: BASE_URL + "/vendor/getAllPaginated",
  GET_VENDOR: BASE_URL + "/vendor/get",
  UPDATE_VENDOR: BASE_URL + "/vendor/update",
  UPDATE_VENDOR_PROFILE: BASE_URL + "/vendor/update-profile",
  UPDATE_VENDOR_PERSANTAGE: BASE_URL + "/vendor/update-percentage",
  UPDATE_VENDOR_WORKING_HOURS: BASE_URL + "/vendor/working-hours",
  REQUST_FOR_THE_UPDATE_PROFILE_API: BASE_URL + "/vendor/request-update",
  DELETE_VENDOR: BASE_URL + "/vendor/delete",
  MY_PROFILE: BASE_URL + "/vendor/my-profile",
  FORGOT_PASSWORD_API: BASE_URL + "/vendor/forgot-password",
  VERIFY_RESET_OTP_API: BASE_URL + "/vendor/verify-reset-otp",
  RESET_PASSWORD_API: BASE_URL + "/vendor/reset-password",
  ADMIN_RESET_PASSWORD_API: BASE_URL + "/vendor/admin-reset-password",
  UPLOAD_PROFILE_IMAGE_API: BASE_URL + "/vendor/upload-profile-image",
  UPDATE_REWARD_SETTINGS_API: BASE_URL + "/vendor/update-reward-settings",
}

// 🔥 Notification APIs
export const notification = {
  // Public Routes
  REGISTER_DEVICE: BASE_URL + "/notification/register-device",
  
  // User/Vendor Routes - Matching Frontend API Structure
  GET_NOTIFICATIONS: BASE_URL + "/notification", // GET with params: userId, vendorId, isGuest
  MARK_AS_READ: BASE_URL + "/notification", // POST /:id/read
  MARK_ALL_AS_READ: BASE_URL + "/notification/mark-all-read", // POST with body
  GET_UNREAD_COUNT: BASE_URL + "/notification/unread-count", // GET with params
  DELETE_NOTIFICATION: BASE_URL + "/notification", // DELETE /:id
  DELETE_ALL: BASE_URL + "/notification/delete-all", // POST with body
  
  // Admin Routes
  GET_STATS: BASE_URL + "/notification/stats",
  SEND_PUSH: BASE_URL + "/notification/send",
  GET_LOGS: BASE_URL + "/notification/logs",
}

export const property = {
  CREATE_PROPERTY_API: BASE_URL + "/property/create",
  GET_VENDOR_PROPERTY_API: BASE_URL + "/property/get-vendor-property",
  GET_ALL_PROPERTY_API: BASE_URL + "/property/getAll",
  UPDATE_PROPERTY_API: BASE_URL + "/property/update", // Admin direct update
  VENDOR_UPDATE_PROPERTY_API: BASE_URL + "/property/vendor-update", // Vendor update request
  UPDATE_PROPERTY_STATUS_API: BASE_URL + "/property/update-status",
  UPLOAD_SERVICE_IMAGE_API: BASE_URL + "/property/upload-service-image",
  DELETE_PROPERTY_API: BASE_URL + "/property/delete",
  GET_PROPERTY_BY_ID_API: BASE_URL + "/property/get",
}

export const serviceUpdateRequest = {
  CREATE_UPDATE_REQUEST_API: BASE_URL + "/service-update-request/create-update-request",
  CREATE_IMAGE_UPDATE_REQUEST_API: BASE_URL + "/service-update-request/create-image-update-request",
  GET_VENDOR_REQUESTS_API: BASE_URL + "/service-update-request/vendor",
  GET_PENDING_REQUESTS_API: BASE_URL + "/service-update-request/pending",
  APPROVE_REQUEST_API: BASE_URL + "/service-update-request/approve",
  REJECT_REQUEST_API: BASE_URL + "/service-update-request/reject",
}

export const category = {
  CREATE_CATEGORY_API: BASE_URL + "/category/create",
  GET_ALL_CATEGORY_API: BASE_URL + "/category/getAll",
  UPDATE_CATEGORY_API: BASE_URL + "/category/update",
  DELETE_CATEGORY_API: BASE_URL + "/category/delete",
  PURCHASE_CATEGORY_API: BASE_URL + "/category/purchase",
  GET_PURCHASED_CATEGORY_API: BASE_URL + "/category/purchased",
  GET_CATEGORY_PURCHASERS_API: BASE_URL + "/category/purchasers",
  GET_PENDING_CATEGORY_PURCHASES_API: BASE_URL + "/category/pending",
  APPROVE_CATEGORY_PURCHASE_API: BASE_URL + "/category/approve",
  REJECT_CATEGORY_PURCHASE_API: BASE_URL + "/category/reject",
}
export const contact = {
  CREATE_CONTACT_API: BASE_URL + "/contact/create",
  CREATE_GENERAL_CONTACT_API: BASE_URL + "/contact/general",
  GET_CONTACT_API: BASE_URL + "/contact/getAll",
  GET_USER_INQUIRY_API: BASE_URL + "/contact/user-inquiry",
}

export const blog = {
  CREATE_BLOG_API: BASE_URL + "/blog/create",
  GET_ALL_BLOG_API: BASE_URL + "/blog/getAll",
  GET_SINGLE_BLOG_API: BASE_URL + "/blog/get",
  GET_SINGLE_BLOG_BY_SLUG_API: BASE_URL + "/blog/slug",
  DELETE_BLOG_API: BASE_URL + "/blog/delete",
  UPDATE_BLOG_API: BASE_URL + "/blog",
}
export const dashboar = {

  ADMIN_DASHBOARD_DATA: BASE_URL + "/dashboard/stats",
  VENDOR_DASHBOARD_DATA: BASE_URL + "/dashboard/vendor-stats",
}

export const customerSupport = {
  CREATE_CUSTOMER_SUPPORT_API: BASE_URL + "/customer-support/create",
  GET_ALL_CUSTOMER_SUPPORT_API: BASE_URL + "/customer-support/getAll",
  UPDATE_SUPPORT_STATUS_API: BASE_URL + "/customer-support/update-status",
  ADD_ADMIN_REMARK_API: BASE_URL + "/customer-support/add-remark",
}

export const job = {
  CREATE_JOB_API: BASE_URL + "/job/create",
  GET_ALL_JOB_API: BASE_URL + "/job/getAll",
  GET_JOB_BY_ID_API: BASE_URL + "/job/get",

}

export const career = {
  CREATE_CAREER_API: BASE_URL + "/career/create",
  GET_ALL_CAREER_API: BASE_URL + "/career/getAll",

}


export const ratingEndpoints = {
  ADD_RATING_API: BASE_URL + "/rating/create",
  GETALL_RATING_API: BASE_URL + "/rating/getAll",
}
export const booking = {
  CREATE_BOOKING: BASE_URL + "/booking/create",
  GET_ALL_BOOKINGS: BASE_URL + "/booking/getAll",
  GET_VENDOR_ALL_BOOKINGS: BASE_URL + "/booking/get",
  UPDATE_BOOKING_STATUS_BOOKINGS: BASE_URL + "/booking/update",
}

export const audit = {
  ADD_AUDIT_API: BASE_URL + "/audit/create",
  GET_ALL_AUDIT_API: BASE_URL + "/audit/getAll",
  ADD_ADMIN_COMMENT_API: BASE_URL + "/audit/add-comment",
}

export const ads = {
  CREATE_ADMIN_AD_API: BASE_URL + "/ads/admin/create",
  CREATE_VENDOR_AD_API: BASE_URL + "/ads/vendor/create",
  GET_ALL_ADS_API: BASE_URL + "/ads/getAll",
  GET_MANAGE_ADS_API: BASE_URL + "/ads/manage",
  GET_VENDOR_ADS_API: BASE_URL + "/ads/vendor",
  APPROVE_VENDOR_AD_API: BASE_URL + "/ads/approve",
  REJECT_VENDOR_AD_API: BASE_URL + "/ads/reject",
  TOGGLE_AD_STATUS_API: BASE_URL + "/ads/toggle-status",
  DELETE_AD_API: BASE_URL + "/ads/delete",
  UPDATE_AD_API: BASE_URL + "/ads/update",
}

export const communicationLogs = {
  GET_ALL_LOGS_API: BASE_URL + "/communication-logs",
  GET_STATS_API: BASE_URL + "/communication-logs/stats",
  DOWNLOAD_LOGS_API: BASE_URL + "/communication-logs/download",
}

export const searchLogs = {
  CREATE_LOG_API: BASE_URL + "/search-logs/create",
  GET_ALL_LOGS_API: BASE_URL + "/search-logs",
  GET_STATS_API: BASE_URL + "/search-logs/stats",
  DOWNLOAD_LOGS_API: BASE_URL + "/search-logs/download",
}

export const coupon = {
  CREATE_COUPON_API: BASE_URL + "/coupon/create",
  GET_ALL_COUPONS_API: BASE_URL + "/coupon/getAll",
  GET_COUPON_BY_ID_API: BASE_URL + "/coupon",
  VALIDATE_COUPON_API: BASE_URL + "/coupon/validate",
  APPLY_COUPON_API: BASE_URL + "/coupon/apply",
  UPDATE_COUPON_API: BASE_URL + "/coupon",
  DELETE_COUPON_API: BASE_URL + "/coupon",
  GET_COUPON_STATS_API: BASE_URL + "/coupon/stats",
}

export const priceKeyFeatures = {
  GET_KEY_FEATURES_API: BASE_URL + "/price-key-features",
  UPSERT_KEY_FEATURES_API: BASE_URL + "/price-key-features",
  DELETE_KEY_FEATURES_API: BASE_URL + "/price-key-features",
}

export const vendorProfileUpdateRequest = {
  CREATE_UPDATE_REQUEST_API: BASE_URL + "/vendor-profile-update-request",
  GET_PENDING_REQUESTS_API: BASE_URL + "/vendor-profile-update-request/pending",
  GET_REQUEST_BY_VENDOR_API: BASE_URL + "/vendor-profile-update-request/vendor",
  APPROVE_REQUEST_API: BASE_URL + "/vendor-profile-update-request/approve",
  REJECT_REQUEST_API: BASE_URL + "/vendor-profile-update-request/reject",
}

export const reward = {
  // Admin APIs
  GET_REWARD_SETTINGS_API: BASE_URL + "/reward/admin/settings",
  UPDATE_REWARD_SETTINGS_API: BASE_URL + "/reward/admin/settings",
  GET_REWARD_APPLICATIONS_API: BASE_URL + "/reward/admin/applications",
  GET_VENDOR_HISTORY_API: BASE_URL + "/reward/admin/vendor-history",
  GET_REWARD_STATISTICS_API: BASE_URL + "/reward/admin/statistics",

  // User APIs
  GET_USER_POINTS_API: BASE_URL + "/reward/user/points",
  GET_USER_HISTORY_API: BASE_URL + "/reward/user/history",
  GENERATE_REDEEM_CODE_API: BASE_URL + "/reward/user/generate-code",
  GET_USER_REDEEM_CODES_API: BASE_URL + "/reward/user/redeem-codes",

  // Vendor APIs
  VERIFY_REDEEM_CODE_API: BASE_URL + "/reward/vendor/verify-code",
  APPLY_REDEEM_CODE_API: BASE_URL + "/reward/vendor/apply-code",
  GET_VENDOR_APPLIED_CODES_API: BASE_URL + "/reward/vendor/applied-codes",
  CHECK_VENDOR_SETTINGS_API: BASE_URL + "/reward/vendor/settings",
}

export const razorpay = {
  CAPTURE_PAYMENT_API: BASE_URL + "/razorpay/capturePayment",
  VERIFY_PAYMENT_API: BASE_URL + "/razorpay/verifyPayment",
}
