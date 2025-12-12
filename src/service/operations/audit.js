import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { audit } from "../apis";


const { ADD_AUDIT_API, GET_ALL_AUDIT_API } = audit;



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



export const getAuditLogsAPI = async (page = 1, limit = 50, vendorId = "") => {
  try {
    // Directly add query params in the URL
    const url = `${GET_ALL_AUDIT_API}?page=${page}&limit=${limit}${vendorId ? `&vendorId=${vendorId}` : ""
      }`;

    const response = await apiConnector("GET", url);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data || {};
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    toast.error(
      error?.response?.data?.message || "Failed to fetch audit logs"
    );
    return {};
  }
};
