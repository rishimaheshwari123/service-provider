import { toast } from "sonner";
import { apiConnector } from "../apiConnector";
import { reward } from "../apis";

// ==================== ADMIN APIs ====================

export const getRewardSettings = async (token: string) => {
  try {
    const response = await apiConnector(
      "GET",
      reward.GET_REWARD_SETTINGS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_REWARD_SETTINGS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch reward settings");
    throw error;
  }
};

export const updateRewardSettings = async (token: string, data: any) => {
  const toastId = toast.loading("Updating reward settings...");
  try {
    const response = await apiConnector(
      "PUT",
      reward.UPDATE_REWARD_SETTINGS_API,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    toast.success("Reward settings updated successfully", { id: toastId });
    return response.data;
  } catch (error: any) {
    console.error("UPDATE_REWARD_SETTINGS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update reward settings", { id: toastId });
    throw error;
  }
};

export const getRewardApplications = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  status: string = "",
  search: string = ""
) => {
  try {
    const response = await apiConnector(
      "GET",
      `${reward.GET_REWARD_APPLICATIONS_API}?page=${page}&limit=${limit}&status=${status}&search=${search}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_REWARD_APPLICATIONS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch reward applications");
    throw error;
  }
};

export const getRewardStatistics = async (token: string) => {
  try {
    const response = await apiConnector(
      "GET",
      reward.GET_REWARD_STATISTICS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_REWARD_STATISTICS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch statistics");
    throw error;
  }
};

// ==================== USER APIs ====================

export const getUserRewardPoints = async (token: string) => {
  try {
    const response = await apiConnector(
      "GET",
      reward.GET_USER_POINTS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_USER_POINTS_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch reward points");
    throw error;
  }
};

export const getUserRewardHistory = async (
  token: string,
  page: number = 1,
  limit: number = 20,
  type: string = "",
  source: string = ""
) => {
  try {
    const response = await apiConnector(
      "GET",
      `${reward.GET_USER_HISTORY_API}?page=${page}&limit=${limit}&type=${type}&source=${source}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_USER_HISTORY_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch reward history");
    throw error;
  }
};

export const generateRedeemCode = async (token: string, points: number) => {
  const toastId = toast.loading("Generating redeem code...");
  try {
    const response = await apiConnector(
      "POST",
      reward.GENERATE_REDEEM_CODE_API,
      { points },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    toast.success("Redeem code generated successfully!", { id: toastId });
    return response.data;
  } catch (error: any) {
    console.error("GENERATE_REDEEM_CODE_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to generate redeem code", { id: toastId });
    throw error;
  }
};

export const getUserRedeemCodes = async (token: string, status: string = "") => {
  try {
    const response = await apiConnector(
      "GET",
      `${reward.GET_USER_REDEEM_CODES_API}?status=${status}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_USER_REDEEM_CODES_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch redeem codes");
    throw error;
  }
};

// ==================== VENDOR APIs ====================

export const verifyRedeemCode = async (token: string, code: string) => {
  try {
    const response = await apiConnector(
      "POST",
      reward.VERIFY_REDEEM_CODE_API,
      { code },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("VERIFY_REDEEM_CODE_API ERROR:", error);
    // Don't show toast here, let the component handle it
    throw error;
  }
};

export const applyRedeemCode = async (token: string, code: string) => {
  const toastId = toast.loading("Applying redeem code...");
  try {
    const response = await apiConnector(
      "POST",
      reward.APPLY_REDEEM_CODE_API,
      { code },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    toast.success("Redeem code applied successfully!", { id: toastId });
    return response.data;
  } catch (error: any) {
    console.error("APPLY_REDEEM_CODE_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to apply redeem code", { id: toastId });
    throw error;
  }
};

export const getVendorAppliedCodes = async (
  token: string,
  page: number = 1,
  limit: number = 20
) => {
  try {
    const response = await apiConnector(
      "GET",
      `${reward.GET_VENDOR_APPLIED_CODES_API}?page=${page}&limit=${limit}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("GET_VENDOR_APPLIED_CODES_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch applied codes");
    throw error;
  }
};

export const checkVendorRewardSettings = async (token: string) => {
  try {
    const response = await apiConnector(
      "GET",
      reward.CHECK_VENDOR_SETTINGS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("CHECK_VENDOR_SETTINGS_API ERROR:", error);
    // Don't show toast for this as it's a check
    throw error;
  }
};
