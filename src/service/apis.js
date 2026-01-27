
export const BASE_URL = "https://service-provider-6ufz.onrender.com/api/v1"
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

}

export const image = {
  IMAGE_UPLOAD: BASE_URL + "/image/multi",
}
export const vendor = {
  LOGIN_API: BASE_URL + "/vendor/login",
  SIGNUP_API: BASE_URL + "/vendor/register",
  GET_ALL_VENDOR: BASE_URL + "/vendor/getAll",
  GET_VENDOR: BASE_URL + "/vendor/get",
  UPDATE_VENDOR: BASE_URL + "/vendor/update",
  UPDATE_VENDOR_PROFILE: BASE_URL + "/vendor/update-profile",
  UPDATE_VENDOR_PERSANTAGE: BASE_URL + "/vendor/update-percentage",
  UPDATE_VENDOR_WORKING_HOURS: BASE_URL + "/vendor/working-hours",
  REQUST_FOR_THE_UPDATE_PROFILE_API: BASE_URL + "/vendor/request-update",
  MY_PROFILE: BASE_URL + "/vendor/my-profile",
}

export const property = {
  CREATE_PROPERTY_API: BASE_URL + "/property/create",
  GET_VENDOR_PROPERTY_API: BASE_URL + "/property/get-vendor-property",
  GET_ALL_PROPERTY_API: BASE_URL + "/property/getAll",
  UPDATE_PROPERTY_API: BASE_URL + "/property/update",
  UPDATE_PROPERTY_STATUS_API: BASE_URL + "/property/update-status",
  DELETE_PROPERTY_API: BASE_URL + "/property/delete",
  GET_PROPERTY_BY_ID_API: BASE_URL + "/property/get",
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
  GET_CONTACT_API: BASE_URL + "/contact/getAll",
  GET_USER_INQUIRY_API: BASE_URL + "/contact/user-inquiry",
}

export const blog = {
  CREATE_BLOG_API: BASE_URL + "/blog/create",
  GET_ALL_BLOG_API: BASE_URL + "/blog/getAll",
  GET_SINGLE_BLOG_API: BASE_URL + "/blog/get",
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
}