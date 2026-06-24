import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { ads } from "../apis";

const {
  CREATE_ADMIN_AD_API,
  CREATE_VENDOR_AD_API,
  GET_ALL_ADS_API,
  GET_MANAGE_ADS_API,
  GET_VENDOR_ADS_API,
  APPROVE_VENDOR_AD_API,
  REJECT_VENDOR_AD_API,
  TOGGLE_AD_STATUS_API,
  DELETE_AD_API,
  UPDATE_AD_API,
} = ads;

export function createAdminAd(data, token, adminId) {
  return async () => {
    try {
      data.append("adminId", adminId || "");
      const response = await apiConnector("POST", CREATE_ADMIN_AD_API, data, {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      toast.success(response?.data?.message || "Admin ad created successfully!");
      return response.data;
    } catch (error) {
      console.error("CREATE ADMIN AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to create admin ad");
      throw error;
    }
  };
}

export function createVendorAd(data, token, vendorId) {
  return async () => {
    try {
      data.append("vendorId", vendorId || "");
      const response = await apiConnector("POST", CREATE_VENDOR_AD_API, data, {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      toast.success(response?.data?.message || "Ad submitted for approval!");
      return response.data;
    } catch (error) {
      console.error("CREATE VENDOR AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to submit ad");
      throw error;
    }
  };
}

export function getManageAds(createdByType = "", approvalStatus = "") {
  return async () => {
    try {
      const query = new URLSearchParams();
      if (createdByType) query.set("createdByType", createdByType);
      if (approvalStatus) query.set("approvalStatus", approvalStatus);
      const url = query.toString() ? `${GET_MANAGE_ADS_API}?${query.toString()}` : GET_MANAGE_ADS_API;
      const response = await apiConnector("GET", url);

      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }

      return response.data.ads || [];
    } catch (error) {
      console.error("GET MANAGE ADS API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to fetch ads");
      return [];
    }
  };
}

export function getVendorAds(vendorId) {
  return async () => {
    try {
      const response = await apiConnector("GET", `${GET_VENDOR_ADS_API}/${vendorId}`);
      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }
      return response.data.ads || [];
    } catch (error) {
      console.error("GET VENDOR ADS API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to fetch your ads");
      return [];
    }
  };
}

export function approveVendorAd(adId, token) {
  return async () => {
    try {
      const response = await apiConnector(
        "PUT",
        `${APPROVE_VENDOR_AD_API}/${adId}`,
        { Authorization: `Bearer ${token}` }
      );
      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }
      toast.success(response?.data?.message || "Vendor ad approved");
      return response.data;
    } catch (error) {
      console.error("APPROVE VENDOR AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to approve vendor ad");
      throw error;
    }
  };
}

export function rejectVendorAd(adId, reason, token) {
  return async () => {
    try {
      const response = await apiConnector(
        "PUT",
        `${REJECT_VENDOR_AD_API}/${adId}`,
        { reason },
        { Authorization: `Bearer ${token}` }
      );
      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }
      toast.success(response?.data?.message || "Vendor ad rejected");
      return response.data;
    } catch (error) {
      console.error("REJECT VENDOR AD API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to reject vendor ad");
      throw error;
    }
  };
}

export function toggleAdStatus(adId, isActive, token) {
  return async () => {
    try {
      const response = await apiConnector(
        "PUT",
        `${TOGGLE_AD_STATUS_API}/${adId}`,
        { isActive },
        { Authorization: `Bearer ${token}` }
      );
      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }
      toast.success(response?.data?.message || "Ad status updated");
      return response.data;
    } catch (error) {
      console.error("TOGGLE AD STATUS API ERROR............", error);
      toast.error(error?.response?.data?.message || "Failed to update ad status");
      throw error;
    }
  };
}

export function deleteAd(adId, token) {
  return async () => {
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
  return async () => {
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

// Public ads for website widgets
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

