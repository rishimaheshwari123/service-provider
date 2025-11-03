import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { category } from "../apis";

const {
  CREATE_CATEGORY_API,
  GET_ALL_CATEGORY_API,
  UPDATE_CATEGORY_API,
  PURCHASE_CATEGORY_API,
  GET_PURCHASED_CATEGORY_API,
  GET_CATEGORY_PURCHASERS_API,
} = category;

export const createCategoryAPI = async (data) => {
  const toastId = toast.loading("Creating category...");
  try {
    const res = await apiConnector("POST", CREATE_CATEGORY_API, data);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    toast.success(res?.data?.message || "Category created");
    return res?.data?.category;
  } catch (error) {
    console.error("CREATE_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create category!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const updateCategoryAPI = async (id, data) => {
  const toastId = toast.loading("Updating category...");
  try {
    const url = `${UPDATE_CATEGORY_API}/${id}`;
    const res = await apiConnector("PUT", url, data);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    toast.success(res?.data?.message || "Category updated");
    return res?.data?.category;
  } catch (error) {
    console.error("UPDATE_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update category!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const getAllCategoriesAPI = async () => {
  try {
    const res = await apiConnector("GET", GET_ALL_CATEGORY_API);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    return res?.data?.categories || [];
  } catch (error) {
    console.error("GET_ALL_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load categories!");
    return [];
  }
};

export const purchaseCategoryAPI = async (payload) => {
  const toastId = toast.loading("Purchasing category...");
  try {
    const res = await apiConnector("POST", PURCHASE_CATEGORY_API, payload);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    toast.success(res?.data?.message || "Purchased successfully");
    return res?.data?.purchase;
  } catch (error) {
    console.error("PURCHASE_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to purchase!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const getPurchasedCategoriesAPI = async (vendorId) => {
  try {
    const res = await apiConnector("GET", `${GET_PURCHASED_CATEGORY_API}/${vendorId}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    return res?.data?.categories || [];
  } catch (error) {
    console.error("GET_PURCHASED_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load purchased categories!");
    return [];
  }
};

export const getCategoryPurchasersAPI = async (categoryId) => {
  try {
    const res = await apiConnector("GET", `${GET_CATEGORY_PURCHASERS_API}/${categoryId}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    return res?.data?.purchasers || [];
  } catch (error) {
    console.error("GET_CATEGORY_PURCHASERS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load purchasers!");
    return [];
  }
};