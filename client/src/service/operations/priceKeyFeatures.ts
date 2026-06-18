import { apiConnector } from "../apiConnector";
import { priceKeyFeatures } from "../apis";

const {
  GET_KEY_FEATURES_API,
  UPSERT_KEY_FEATURES_API,
  DELETE_KEY_FEATURES_API,
} = priceKeyFeatures;

// Get key features (common for all categories)
export const getKeyFeaturesAPI = async () => {
  try {
    const response = await apiConnector("GET", GET_KEY_FEATURES_API);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching key features:", error);
    throw error;
  }
};

// Create or update key features (common for all categories)
export const upsertKeyFeaturesAPI = async (data: {
  price?: { features: string[] };
  premiumPrice?: { features: string[] };
  premiumPlusPrice?: { features: string[] };
}) => {
  try {
    const response = await apiConnector("PUT", UPSERT_KEY_FEATURES_API, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating key features:", error);
    throw error;
  }
};

// Delete key features
export const deleteKeyFeaturesAPI = async () => {
  try {
    const response = await apiConnector("DELETE", DELETE_KEY_FEATURES_API);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting key features:", error);
    throw error;
  }
};
