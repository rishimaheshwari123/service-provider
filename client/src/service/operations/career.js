import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { career } from "../apis";


const {
  CREATE_CAREER_API, GET_ALL_CAREER_API } = career;

export const createCareerAPI = async (submissionData) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("POST", CREATE_CAREER_API, submissionData);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }
    toast.success(response?.data?.message)

    return response?.data?.application;
  } catch (error) {
    console.error("career API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create career!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }

};



export const getApplicationAPI = async () => {

  try {
    const response = await apiConnector("GET", `${GET_ALL_CAREER_API}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.applications || [];
  } catch (error) {
    console.error("GET application API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get application !");
    return [];
  }
};