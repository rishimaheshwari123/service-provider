
const BASE_URL = "http://localhost:8000/api/v1"
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

}