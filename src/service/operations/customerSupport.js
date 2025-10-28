import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { customerSupport } from "../apis";


const {
  CREATE_CUSTOMER_SUPPORT_API, GET_ALL_CUSTOMER_SUPPORT_API } = customerSupport;

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



export const getCustomerSupportRequestAPI = async () => {

  try {
    const response = await apiConnector("GET", `${GET_ALL_CUSTOMER_SUPPORT_API}`)


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
