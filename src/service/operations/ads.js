import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { ads } from "../apis";

const { CREATE_AD_API, GET_ALL_ADS_API, DELETE_AD_API, UPDATE_AD_API } = ads;

export function createAd(data, token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("POST", CREATE_AD_API, data, {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      toast.success("Ad created successfully!");
      return response.data;
    } catch (error) {
      console.error("CREATE AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to create ad");
      throw error;
    }
  };
}

export function getAllAds() {
  return async (dispatch) => {
    try {
      const response = await apiConnector("GET", GET_ALL_ADS_API);

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      return response.data.ads || [];
    } catch (error) {
      console.error("GET ALL ADS API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to fetch ads");
      return [];
    }
  };
}

export function deleteAd(adId, token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("DELETE", `${DELETE_AD_API}/${adId}`, null, {
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      toast.success("Ad deleted successfully!");
      return response.data;
    } catch (error) {
      console.error("DELETE AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to delete ad");
      throw error;
    }
  };
}

export function updateAd(adId, data, token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("PUT", `${UPDATE_AD_API}/${adId}`, data, {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      toast.success("Ad updated successfully!");
      return response.data;
    } catch (error) {
      console.error("UPDATE AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to update ad");
      throw error;
    }
  };
}

// Function to get active ads for display (without authentication)
export async function getActiveAds() {
  try {
    const response = await apiConnector("GET", GET_ALL_ADS_API);
    
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }

    return response.data.ads || [];
  } catch (error) {
    console.error("GET ACTIVE ADS ERROR............", error);
    return [];
  }
}