import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { coupon } from "../apis";

const {
  CREATE_COUPON_API,
  GET_ALL_COUPONS_API,
  GET_COUPON_BY_ID_API,
  VALIDATE_COUPON_API,
  APPLY_COUPON_API,
  UPDATE_COUPON_API,
  DELETE_COUPON_API,
  GET_COUPON_STATS_API,
} = coupon;

// Create a new coupon
export const createCouponAPI = async (couponData, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("POST", CREATE_COUPON_API, couponData, headers);

    if (response.data.success) {
      toast.success("Coupon created successfully!");
      return response.data.coupon;
    }
  } catch (error) {
    console.error("CREATE COUPON API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to create coupon";
    toast.error(message);
    throw error;
  }
};

// Get all coupons
export const getAllCouponsAPI = async (token = null, params = {}) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("GET", GET_ALL_COUPONS_API, null, headers, params);

    if (response.data.success) {
      return response.data;
    }
  } catch (error) {
    console.error("GET ALL COUPONS API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to fetch coupons";
    toast.error(message);
    throw error;
  }
};

// Get coupon by ID
export const getCouponByIdAPI = async (couponId, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("GET", `${GET_COUPON_BY_ID_API}/${couponId}`, null, headers);

    if (response.data.success) {
      return response.data.coupon;
    }
  } catch (error) {
    console.error("GET COUPON BY ID API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to fetch coupon";
    toast.error(message);
    throw error;
  }
};

// Validate coupon
export const validateCouponAPI = async (validationData, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("POST", VALIDATE_COUPON_API, validationData, headers);

    if (response.data.success) {
      return response.data;
    }
  } catch (error) {
    console.error("VALIDATE COUPON API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to validate coupon";
    toast.error(message);
    throw error;
  }
};

// Apply coupon
export const applyCouponAPI = async (applicationData, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("POST", APPLY_COUPON_API, applicationData, headers);

    if (response.data.success) {
      return response.data;
    }
  } catch (error) {
    console.error("APPLY COUPON API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to apply coupon";
    toast.error(message);
    throw error;
  }
};

// Update coupon
export const updateCouponAPI = async (couponId, updateData, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("PUT", `${UPDATE_COUPON_API}/${couponId}`, updateData, headers);

    if (response.data.success) {
      toast.success("Coupon updated successfully!");
      return response.data.coupon;
    }
  } catch (error) {
    console.error("UPDATE COUPON API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to update coupon";
    toast.error(message);
    throw error;
  }
};

// Delete coupon
export const deleteCouponAPI = async (couponId, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("DELETE", `${DELETE_COUPON_API}/${couponId}`, null, headers);

    if (response.data.success) {
      toast.success("Coupon deleted successfully!");
      return true;
    }
  } catch (error) {
    console.error("DELETE COUPON API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to delete coupon";
    toast.error(message);
    throw error;
  }
};

// Get coupon statistics
export const getCouponStatsAPI = async (token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiConnector("GET", GET_COUPON_STATS_API, null, headers);

    if (response.data.success) {
      return response.data.stats;
    }
  } catch (error) {
    console.error("GET COUPON STATS API ERROR:", error);
    const message = error?.response?.data?.message || "Failed to fetch coupon statistics";
    toast.error(message);
    throw error;
  }
};