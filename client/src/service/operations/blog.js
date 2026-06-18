import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { blog } from "../apis";


const {
  CREATE_BLOG_API, GET_ALL_BLOG_API, DELETE_BLOG_API, GET_SINGLE_BLOG_API, GET_SINGLE_BLOG_BY_SLUG_API, UPDATE_BLOG_API } = blog;

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



export const getAllBlogsAPI = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        queryParams.append(key, val);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${GET_ALL_BLOG_API}?${queryString}` : GET_ALL_BLOG_API;
    
    const response = await apiConnector("GET", url);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    // Return the full response containing blogs and pagination if parameters are supplied,
    // otherwise fallback to the raw blogs array for compatibility.
    if (Object.keys(params).length > 0) {
      return response?.data;
    }
    return response?.data?.blogs || [];
  } catch (error) {
    console.error("GET blogs API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get blogs !");
    if (Object.keys(params).length > 0) {
      return { success: false, blogs: [], pagination: { current: 1, pages: 0, total: 0 } };
    }
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

export const getSingleBlogBySlugAPI = async (slug) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("GET", `${GET_SINGLE_BLOG_BY_SLUG_API}/${slug}`);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data?.blog;
  } catch (error) {
    console.error("blog API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get blog!");
    return null;
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