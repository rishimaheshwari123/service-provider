import { toast } from "sonner";
import { vendor } from "../apis";

// Send OTP function
export const sendOTP = async (phoneData) => {
  try {
    console.log('📤 Sending OTP request:', phoneData);
    
    const response = await fetch(vendor.SEND_OTP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(phoneData),
    });

    const result = await response.json();
    console.log('📥 OTP Response:', result);

    if (result.success) {
      toast.success(result.message || "OTP sent successfully!");
      return result;
    } else {
      toast.error(result.message || "Failed to send OTP");
      return result;
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    toast.error("Network error. Please check your connection.");
    return { success: false, message: "Network error" };
  }
};

// Verify OTP function
export const verifyOTP = async (otpData) => {
  try {
    const response = await fetch(vendor.VERIFY_OTP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(otpData),
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      return result;
    } else {
      toast.error(result.message || "Invalid OTP");
      return result;
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);
    toast.error("Network error. Please check your connection.");
    return { success: false, message: "Network error" };
  }
};