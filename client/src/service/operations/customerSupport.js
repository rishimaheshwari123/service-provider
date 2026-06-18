import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { customerSupport } from "../apis";


const {
  CREATE_CUSTOMER_SUPPORT_API, 
  GET_ALL_CUSTOMER_SUPPORT_API,
  UPDATE_SUPPORT_STATUS_API,
  ADD_ADMIN_REMARK_API
} = customerSupport;

export const createCustomerSupportAPI = async (jobData) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("POST", CREATE_CUSTOMER_SUPPORT_API, jobData);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }
    toast.success(response?.data?.message)

    return response?.data;
  } catch (error) {
    console.error("job API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create job!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }

};



export const getCustomerSupportRequestAPI = async (token) => {

  try {
    const response = await apiConnector(
      "GET", 
      `${GET_ALL_CUSTOMER_SUPPORT_API}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data || [];
  } catch (error) {
    console.error("GET support API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get requiest !");
    return [];
  }
};

export const updateSupportStatusAPI = async (id, status, token) => {
  try {
    const response = await apiConnector(
      "PUT", 
      `${UPDATE_SUPPORT_STATUS_API}/${id}`, 
      { status },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Status updated successfully!");
    return response?.data;
  } catch (error) {
    console.error("UPDATE support status API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update status!");
    return null;
  }
};

export const addAdminRemarkAPI = async (id, remark, adminId, token) => {
  const toastId = toast.loading("Adding remark...");
  
  try {
    const response = await apiConnector(
      "POST", 
      `${ADD_ADMIN_REMARK_API}/${id}`, 
      { remark, adminId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Remark added successfully!");
    return response?.data;
  } catch (error) {
    console.error("ADD admin remark API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to add remark!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
