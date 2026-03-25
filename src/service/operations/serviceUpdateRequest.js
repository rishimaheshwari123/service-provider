import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { serviceUpdateRequest, property } from "../apis";

const {
  CREATE_UPDATE_REQUEST_API,
  CREATE_IMAGE_UPDATE_REQUEST_API,
  GET_VENDOR_REQUESTS_API,
  GET_PENDING_REQUESTS_API,
  APPROVE_REQUEST_API,
  REJECT_REQUEST_API,
} = serviceUpdateRequest;

const { UPLOAD_SERVICE_IMAGE_API } = property;

// Create service update request (vendor)
export const createServiceUpdateRequestAPI = async (propertyId, updateData) => {
  const toastId = toast.loading("Submitting update request...");

  try {
    const response = await apiConnector(
      "PUT", 
      `${CREATE_UPDATE_REQUEST_API}/${propertyId}`, 
      updateData
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Update request submitted successfully!");
    return response?.data;
  } catch (error) {
    console.error("CREATE Service Update Request API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to submit update request!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Create image update request (vendor)
export const createImageUpdateRequestAPI = async (propertyId, imageData) => {
  const toastId = toast.loading("Submitting image update request...");

  try {
    const response = await apiConnector(
      "PUT", 
      `${UPLOAD_SERVICE_IMAGE_API}/${propertyId}`, 
      imageData
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Image update request submitted successfully!");
    return response?.data;
  } catch (error) {
    console.error("CREATE Image Update Request API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to submit image update request!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get vendor's service update requests
export const getVendorServiceUpdateRequestsAPI = async (vendorId) => {
  try {
    const response = await apiConnector("GET", `${GET_VENDOR_REQUESTS_API}/${vendorId}`);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.requests || [];
  } catch (error) {
    console.error("GET Vendor Service Update Requests API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch update requests!");
    return [];
  }
};

// Get all pending service update requests (admin)
export const getPendingServiceUpdateRequestsAPI = async () => {
  try {
    const response = await apiConnector("GET", GET_PENDING_REQUESTS_API);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.requests || [];
  } catch (error) {
    console.error("GET Pending Service Update Requests API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch pending requests!");
    return [];
  }
};

// Approve service update request (admin)
export const approveServiceUpdateRequestAPI = async (requestId, adminId, message = "") => {
  const toastId = toast.loading("Approving request...");

  try {
    const response = await apiConnector(
      "PUT", 
      `${APPROVE_REQUEST_API}/${requestId}`, 
      { adminId, message }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Request approved successfully!");
    return response?.data;
  } catch (error) {
    console.error("APPROVE Service Update Request API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to approve request!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Reject service update request (admin)
export const rejectServiceUpdateRequestAPI = async (requestId, adminId, message = "") => {
  const toastId = toast.loading("Rejecting request...");

  try {
    const response = await apiConnector(
      "PUT", 
      `${REJECT_REQUEST_API}/${requestId}`, 
      { adminId, message }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Request rejected successfully!");
    return response?.data;
  } catch (error) {
    console.error("REJECT Service Update Request API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reject request!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};