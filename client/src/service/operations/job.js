import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { job } from "../apis";


const {
  CREATE_JOB_API, GET_ALL_JOB_API, GET_JOB_BY_ID_API } = job;

export const createJobAPI = async (jobData) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("POST", CREATE_JOB_API, jobData);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }
    toast.success(response?.data?.message)

    return response?.data?.job;
  } catch (error) {
    console.error("job API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create job!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }

};



export const getJobsAPI = async () => {

  try {
    const response = await apiConnector("GET", `${GET_ALL_JOB_API}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.jobs || [];
  } catch (error) {
    console.error("GET job API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get jobs !");
    return [];
  }
};
export const getJobByIdAPI = async (id) => {

  try {
    const response = await apiConnector("GET", `${GET_JOB_BY_ID_API}/${id}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.job || [];
  } catch (error) {
    console.error("GET job API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get jobs !");
    return [];
  }
};