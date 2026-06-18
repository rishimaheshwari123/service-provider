import { toast } from "sonner";
import { vendor } from "../apis";
import { apiConnector } from "../apiConnector";

// Send OTP function using axios instance (with API key)
export const sendOTP = async (phoneData) => {
  try {
    console.log('📤 Sending OTP request:', phoneData);
    
    const response = await apiConnector("POST", vendor.SEND_OTP_API, phoneData);

    console.log('📥 OTP Response:', response.data);

    if (response.data.success) {
      toast.success(response.data.message || "OTP sent successfully!");
      return response.data;
    } else {
      toast.error(response.data.message || "Failed to send OTP");
      return response.data;
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    const errorMessage = error.response?.data?.message || "Network error. Please check your connection.";
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};

// Verify OTP function using axios instance (with API key)
export const verifyOTP = async (otpData) => {
  try {
    console.log('📤 Verifying OTP:', { ...otpData, otp: '******' }); // Don't log actual OTP
    
    const response = await apiConnector("POST", vendor.VERIFY_OTP_API, otpData);

    console.log('📥 Verify OTP Response:', response.data);

    if (response.data.success) {
      toast.success(response.data.message || "OTP verified successfully!");
      return response.data;
    } else {
      toast.error(response.data.message || "Invalid OTP");
      return response.data;
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);
    const errorMessage = error.response?.data?.message || "Network error. Please check your connection.";
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};
