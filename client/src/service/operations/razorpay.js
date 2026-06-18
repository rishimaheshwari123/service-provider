import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { razorpay } from "../apis";

const { CAPTURE_PAYMENT_API, VERIFY_PAYMENT_API } = razorpay;

export const capturePaymentAPI = async (amount) => {
  try {
    const response = await apiConnector("POST", CAPTURE_PAYMENT_API, { amount });
    if (!response?.data?.success && !response?.data?.order) {
      throw new Error(response?.data?.message || "Failed to initiate payment");
    }
    return response.data;
  } catch (error) {
    console.error("CAPTURE_PAYMENT_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to initiate payment");
    throw error;
  }
};

export const verifyPaymentAPI = async (payload) => {
  try {
    const response = await apiConnector("POST", VERIFY_PAYMENT_API, payload);
    return response;
  } catch (error) {
    console.error("VERIFY_PAYMENT_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Payment verification error");
    throw error;
  }
};
