import { apiConnector } from "../apiConnector";
import { vendorProfileUpdateRequest } from "../apis";

const {
  CREATE_UPDATE_REQUEST_API,
  GET_PENDING_REQUESTS_API,
  GET_REQUEST_BY_VENDOR_API,
  APPROVE_REQUEST_API,
  REJECT_REQUEST_API,
} = vendorProfileUpdateRequest;

// Create profile update request
export const createProfileUpdateRequestAPI = async (vendorId: string, data: FormData) => {
  try {
    const response = await apiConnector(
      "POST",
      `${CREATE_UPDATE_REQUEST_API}/${vendorId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating profile update request:", error);
    throw error;
  }
};

// Get pending update requests (admin)
export const getPendingUpdateRequestsAPI = async () => {
  try {
    const response = await apiConnector("GET", GET_PENDING_REQUESTS_API);
    return response.data.requests;
  } catch (error: any) {
    console.error("Error fetching pending requests:", error);
    throw error;
  }
};

// Get update request by vendor ID
export const getUpdateRequestByVendorIdAPI = async (vendorId: string) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_REQUEST_BY_VENDOR_API}/${vendorId}`
    );
    return response.data.request;
  } catch (error: any) {
    console.error("Error fetching update request:", error);
    throw error;
  }
};

// Approve update request (admin)
export const approveUpdateRequestAPI = async (requestId: string, adminId: string) => {
  try {
    const response = await apiConnector(
      "PUT",
      `${APPROVE_REQUEST_API}/${requestId}`,
      { adminId }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error approving update request:", error);
    throw error;
  }
};

// Reject update request (admin)
export const rejectUpdateRequestAPI = async (
  requestId: string,
  adminId: string,
  reason: string
) => {
  try {
    const response = await apiConnector(
      "PUT",
      `${REJECT_REQUEST_API}/${requestId}`,
      { adminId, reason }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error rejecting update request:", error);
    throw error;
  }
};
