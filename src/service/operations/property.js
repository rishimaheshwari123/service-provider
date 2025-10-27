import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { property } from "../apis";


const {
  CREATE_PROPERTY_API,
  GET_VENDOR_PROPERTY_API, UPDATE_PROPERTY_API, GET_ALL_PROPERTY_API, DELETE_PROPERTY_API, GET_PROPERTY_BY_ID_API } = property;

export const createPropertyAPI = async (formData) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("POST", CREATE_PROPERTY_API, formData);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response;
  } catch (error) {
    console.error("CATEGORY API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create category!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }

};


export const getVendorPropertyAPI = async (vendor) => {

  try {
    const response = await apiConnector("POST", GET_VENDOR_PROPERTY_API, vendor)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.properties || [];
  } catch (error) {
    console.error("GET vendor property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor property!");
    return [];
  }

};
export const getAllPropertyAPI = async (vendor) => {

  try {
    const response = await apiConnector("GET", GET_ALL_PROPERTY_API)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.properties || [];
  } catch (error) {
    console.error("GET vendor property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor property!");
    return [];
  }

};
export const getPropertyBYIDAPI = async (id) => {

  try {
    const response = await apiConnector("GET", `${GET_PROPERTY_BY_ID_API}/${id}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.property || [];
  } catch (error) {
    console.error("GET vendor property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor property!");
    return [];
  }

};



export const updatePropertyAPI = async (id, formData) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_PROPERTY_API}/${id}`, formData);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("UPDATE Vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to vendor product!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};
export const deletePropertyAPI = async (id) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("DELETE", `${DELETE_PROPERTY_API}/${id}`);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("UPDATE Vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to vendor product!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};

