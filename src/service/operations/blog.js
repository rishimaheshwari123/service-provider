import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { blog } from "../apis";


const {
  CREATE_BLOG_API, GET_ALL_BLOG_API, DELETE_BLOG_API, GET_SINGLE_BLOG_API, UPDATE_BLOG_API } = blog;

export const createBlogAPI = async (formDataToSend) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("POST", CREATE_BLOG_API, formDataToSend);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }
    toast.success(response?.data?.message)
    return response?.data?.blog;
  } catch (error) {
    console.error("blog API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create blog!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }

};



export const getAllBlogsAPI = async (id) => {

  try {
    const response = await apiConnector("GET", `${GET_ALL_BLOG_API}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.blogs || [];
  } catch (error) {
    console.error("GET blogs API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get blogs !");
    return [];
  }
};


export const deleteBlogAPI = async (id) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("DELETE", `${DELETE_BLOG_API}/${id}`);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("blog API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to delete blog!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};
export const getSingleBlogAPI = async (id) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("GET", `${GET_SINGLE_BLOG_API}/${id}`);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data?.blog;
  } catch (error) {
    console.error("blog API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get blog!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};
export const updateBlogApi = async (id, formDataToSend) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_BLOG_API}/${id}`, formDataToSend);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("blog API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get blog!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};