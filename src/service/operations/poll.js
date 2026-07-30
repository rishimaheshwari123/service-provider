import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { BASE_URL } from "../apis";

const pollEndpoints = {
  CREATE_POLL_API: BASE_URL + "/poll/admin/create",
  GET_ALL_POLLS_API: BASE_URL + "/poll/getAll",
  GET_ADMIN_POLLS_API: BASE_URL + "/poll/admin/getAll",
  VOTE_POLL_API: BASE_URL + "/poll/vote",
  UPDATE_POLL_STATUS_API: BASE_URL + "/poll/admin/status",
  DELETE_POLL_API: BASE_URL + "/poll/admin/delete",
};

const buildUrl = (baseUrl, params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const createPollAPI = async (formData) => {
  const toastId = toast.loading("Creating poll...");

  try {
    const res = await apiConnector("POST", pollEndpoints.CREATE_POLL_API, formData);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    toast.success(res?.data?.message || "Poll created");
    return res?.data?.poll;
  } catch (error) {
    console.error("CREATE_POLL_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create poll!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const getPollsAPI = async (params = {}) => {
  try {
    const res = await apiConnector("GET", buildUrl(pollEndpoints.GET_ALL_POLLS_API, params));
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    return res?.data?.polls || [];
  } catch (error) {
    console.error("GET_POLLS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load polls!");
    return [];
  }
};

export const getAdminPollsAPI = async (params = {}) => {
  try {
    const res = await apiConnector("GET", buildUrl(pollEndpoints.GET_ADMIN_POLLS_API, params));
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    return res?.data?.polls || [];
  } catch (error) {
    console.error("GET_ADMIN_POLLS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load admin polls!");
    return [];
  }
};

export const votePollAPI = async (pollId, vote) => {
  try {
    const res = await apiConnector("POST", `${pollEndpoints.VOTE_POLL_API}/${pollId}`, { vote });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    toast.success(res?.data?.message || "Vote counted");
    return res?.data?.poll;
  } catch (error) {
    console.error("VOTE_POLL_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to vote!");
    return null;
  }
};

export const updatePollStatusAPI = async (pollId, active) => {
  const toastId = toast.loading("Updating poll...");

  try {
    const res = await apiConnector("PATCH", `${pollEndpoints.UPDATE_POLL_STATUS_API}/${pollId}`, {
      active,
    });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    toast.success(res?.data?.message || "Poll updated");
    return res?.data?.poll;
  } catch (error) {
    console.error("UPDATE_POLL_STATUS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update poll!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const deletePollAPI = async (pollId) => {
  const toastId = toast.loading("Deleting poll...");

  try {
    const res = await apiConnector("DELETE", `${pollEndpoints.DELETE_POLL_API}/${pollId}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");

    toast.success(res?.data?.message || "Poll deleted");
    return res?.data;
  } catch (error) {
    console.error("DELETE_POLL_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to delete poll!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
