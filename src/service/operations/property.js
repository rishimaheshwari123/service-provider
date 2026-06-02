import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { property } from "../apis";


const {
  CREATE_PROPERTY_API,
  GET_VENDOR_PROPERTY_API, 
  UPDATE_PROPERTY_API,
  VENDOR_UPDATE_PROPERTY_API,
  GET_ALL_PROPERTY_API, 
  DELETE_PROPERTY_API, 
  GET_PROPERTY_BY_ID_API, 
  UPDATE_PROPERTY_STATUS_API,
  UPLOAD_SERVICE_IMAGE_API
} = property;

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
    // toast.error(error?.response?.data?.message || "Failed to get vendor property!");
    return [];
  }

};
export const getAllPropertyAPI = async (filters = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }
    if (filters.includeInactive) {
      params.append('includeInactive', 'true');
    }
    if (filters.serviceLocation && filters.serviceLocation.trim()) {
      params.append('serviceLocation', filters.serviceLocation.trim());
    }
    
    const url = params.toString() ? `${GET_ALL_PROPERTY_API}?${params.toString()}` : GET_ALL_PROPERTY_API;
    const response = await apiConnector("GET", url);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    // Return full response with pagination if available
    if (response?.data?.pagination) {
      return {
        properties: response?.data?.properties || [],
        pagination: response.data.pagination
      };
    }

    // Backward compatible: return just properties array
    return response?.data?.properties || [];
  } catch (error) {
    console.error("GET vendor property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor property!");
    return [];
  }
};


export const getPropertyBYIDAPI = async (id, userId) => {
  try {
    // ✅ Build URL conditionally
    let url = `${GET_PROPERTY_BY_ID_API}/${id}`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await apiConnector("GET", url);

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




// Admin direct update (no approval needed)
export const updatePropertyAPI = async (id, formData) => {
  const toastId = toast.loading("Updating service...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_PROPERTY_API}/${id}`, formData);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Service updated successfully!");
    return response?.data;
  } catch (error) {
    console.error("UPDATE Property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update service!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }
};

// Vendor update request (requires approval)
export const vendorUpdatePropertyAPI = async (id, formData) => {
  const toastId = toast.loading("Submitting update request...");

  try {
    const response = await apiConnector("PUT", `${VENDOR_UPDATE_PROPERTY_API}/${id}`, formData);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Update request submitted successfully! Waiting for admin approval.");
    return response?.data;
  } catch (error) {
    console.error("VENDOR UPDATE Property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to submit update request!");
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
    console.error("DELETE Property API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to delete property!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }
};

export const updatePropertyStatusAPI = async (id, status) => {
  const toastId = toast.loading("Updating status...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_PROPERTY_STATUS_API}/${id}`, { status });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message);
    return response?.data;
  } catch (error) {
    console.error("UPDATE Property Status API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update property status!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const uploadServiceImageAPI = async (id, imageData) => {
  const toastId = toast.loading("Submitting image update request...");

  try {
    const response = await apiConnector("PUT", `${UPLOAD_SERVICE_IMAGE_API}/${id}`, imageData);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Image update request submitted successfully! Waiting for admin approval.");
    return response?.data;
  } catch (error) {
    console.error("UPLOAD Service Image API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to submit image update request!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};