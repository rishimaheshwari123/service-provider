import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { contact } from "../apis";


const {
  CREATE_CONTACT_API, GET_CONTACT_API } = contact;

export const createContactAPI = async (contactData) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("POST", CREATE_CONTACT_API, contactData);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.newContact;
  } catch (error) {
    console.error("contact API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create contact!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }

};



export const getVendorContactAPI = async (id) => {

  try {
    const response = await apiConnector("GET", `${GET_CONTACT_API}/${id}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.contacts || [];
  } catch (error) {
    console.error("GET contact API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get contact !");
    return [];
  }
};