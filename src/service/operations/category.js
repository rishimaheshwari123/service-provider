import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { category } from "../apis";

const {
  CREATE_CATEGORY_API,
  GET_ALL_CATEGORY_API,
  UPDATE_CATEGORY_API,
  DELETE_CATEGORY_API,
  PURCHASE_CATEGORY_API,
  GET_PURCHASED_CATEGORY_API,
  GET_CATEGORY_PURCHASERS_API,
  GET_PENDING_CATEGORY_PURCHASES_API,
  APPROVE_CATEGORY_PURCHASE_API,
  REJECT_CATEGORY_PURCHASE_API,
} = category;

export const createCategoryAPI = async (formData) => {
  const toastId = toast.loading("Creating category...");
  try {
    const res = await apiConnector("POST", CREATE_CATEGORY_API, formData);
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

export const updateCategoryAPI = async (id, formData) => {
  const toastId = toast.loading("Updating category...");
  try {
    const url = `${UPDATE_CATEGORY_API}/${id}`;
    const res = await apiConnector("PUT", url, formData);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    
    // Show enhanced success message if properties were updated
    const successMessage = res?.data?.updatedPropertiesCount > 0 
      ? `${res?.data?.message} (${res?.data?.updatedPropertiesCount} services updated)`
      : res?.data?.message || "Category updated";
    
    toast.success(successMessage);
    return res?.data?.category;
  } catch (error) {
    console.error("UPDATE_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update category!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const deleteCategoryAPI = async (id) => {
  const toastId = toast.loading("Deleting category...");
  try {
    const url = `${DELETE_CATEGORY_API}/${id}`;
    const res = await apiConnector("DELETE", url);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    toast.success(res?.data?.message || "Category deleted successfully");
    return res?.data;
  } catch (error) {
    console.error("DELETE_CATEGORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to delete category!");
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
  console.log("🔍 purchaseCategoryAPI called with payload:", payload);
  
  const toastId = toast.loading("Purchasing category...");
  try {
    console.log("📤 Making API request to:", PURCHASE_CATEGORY_API);
    console.log("📋 Request payload:", JSON.stringify(payload, null, 2));
    
    const res = await apiConnector("POST", PURCHASE_CATEGORY_API, payload);
    
    console.log("📥 API Response:", {
      status: res.status,
      success: res?.data?.success,
      message: res?.data?.message,
      purchase: res?.data?.purchase
    });
    
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    
    toast.success(res?.data?.message || "Purchased successfully");
    console.log("✅ Purchase API completed successfully");
    return res?.data?.purchase;
  } catch (error) {
    console.error("❌ PURCHASE_CATEGORY_API ERROR:", error);
    console.error("Error details:", {
      message: error.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: PURCHASE_CATEGORY_API
    });
    
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

export const getPendingCategoryPurchasesAPI = async () => {
  console.log("🔍 getPendingCategoryPurchasesAPI called");
  
  try {
    console.log("📤 Making request to:", GET_PENDING_CATEGORY_PURCHASES_API);
    
    const res = await apiConnector("GET", GET_PENDING_CATEGORY_PURCHASES_API);
    
    console.log("📥 Pending purchases response:", {
      status: res.status,
      success: res?.data?.success,
      pendingCount: res?.data?.pending?.length || 0
    });
    
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    
    const pending = res?.data?.pending || [];
    console.log("📊 Pending purchases data:", pending);
    
    return pending;
  } catch (error) {
    console.error("❌ GET_PENDING_CATEGORY_PURCHASES_API ERROR:", error);
    console.error("Error details:", {
      message: error.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    
    toast.error(error?.response?.data?.message || "Failed to load pending approvals!");
    return [];
  }
};

export const getVendorPendingCategoryPurchasesAPI = async (vendorId) => {
  try {
    const res = await apiConnector("GET", `${GET_PENDING_CATEGORY_PURCHASES_API}/${vendorId}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    return res?.data?.pending || [];
  } catch (error) {
    console.error("GET_VENDOR_PENDING_CATEGORY_PURCHASES_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load pending purchases!");
    return [];
  }
};

export const approveCategoryPurchaseAPI = async (purchaseId) => {
  const toastId = toast.loading("Approving purchase...");
  try {
    const res = await apiConnector("PUT", `${APPROVE_CATEGORY_PURCHASE_API}/${purchaseId}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
    toast.success(res?.data?.message || "Approved");
    return res?.data?.purchase;
  } catch (error) {
    console.error("APPROVE_CATEGORY_PURCHASE_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to approve!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const rejectCategoryPurchaseAPI = async (purchaseId, data) => {
  const toastId = toast.loading("Rejecting purchase...");
  try {
    const res = await apiConnector(
      "PUT",
      `${REJECT_CATEGORY_PURCHASE_API}/${purchaseId}`,
      data // ✅ send reason to backend
    );

    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    toast.success(res?.data?.message || "Rejected");
    return res?.data?.purchase;
  } catch (error) {
    console.error("REJECT_CATEGORY_PURCHASE_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reject!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
