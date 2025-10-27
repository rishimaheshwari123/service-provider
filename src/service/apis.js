
const BASE_URL = "https://service-provider-6ufz.onrender.com/api/v1"
// const BASE_URL = "http://localhost:8000/api/v1"
// const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const endpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API_API: BASE_URL + "/auth/register",
  GET_ALL_USER_API: BASE_URL + "/auth/getAll",

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
}

export const property = {
  CREATE_PROPERTY_API: BASE_URL + "/property/create",
  GET_VENDOR_PROPERTY_API: BASE_URL + "/property/get-vendor-property",
  GET_ALL_PROPERTY_API: BASE_URL + "/property/getAll",
  UPDATE_PROPERTY_API: BASE_URL + "/property/update",
  DELETE_PROPERTY_API: BASE_URL + "/property/delete",
  GET_PROPERTY_BY_ID_API: BASE_URL + "/property/get",
}
export const contact = {
  CREATE_CONTACT_API: BASE_URL + "/contact/create",
  GET_CONTACT_API: BASE_URL + "/contact/getAll",
}