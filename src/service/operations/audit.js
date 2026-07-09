import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { audit } from "../apis";


const { ADD_AUDIT_API, GET_ALL_AUDIT_API, ADD_ADMIN_COMMENT_API } = audit;



export const createAuditForPropertyCallAndEmailAPI = async (id, userId, type) => {
  try {
    const response = await apiConnector(
      "POST",
      `${ADD_AUDIT_API}/${id}?userId=${userId}`, { type }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data || [];
  } catch (error) {
    console.error("Create call email logs error:", error);
    toast.error(error?.response?.data?.message);
    return [];
  }
};



export const getAuditLogsAPI = async (
  page = 1,
  limit = 50,
  activeSearch = "",
  vendorId = "",
  token
) => {
  try {
    // Build query params safely
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (activeSearch) {
      params.append("searchQuery", activeSearch);
    }

    if (vendorId) {
      params.append("vendorId", vendorId);
    }

    const url = `${GET_ALL_AUDIT_API}?${params.toString()}`;

    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;

  } catch (error) {
    console.error("Fetch audit logs error:", error);
    toast.error(
      error?.response?.data?.message || "Failed to fetch audit logs"
    );

    return {};

  }
};



export const addAdminCommentAPI = async (id, comment, adminId, token) => {
  const toastId = toast.loading("Adding comment...");

  try {
    const response = await apiConnector(
      "POST",
      `${ADD_ADMIN_COMMENT_API}/${id}`,
      { comment, adminId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Comment added successfully!");
    return response?.data;
  } catch (error) {
    console.error("ADD admin comment API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to add comment!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
