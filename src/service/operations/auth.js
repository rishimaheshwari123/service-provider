import { toast } from "react-toastify";
import { setUser, setToken } from "../../redux/authSlice";
import { apiConnector } from "../apiConnector";
import { endpoints, vendor } from "../apis";
import Swal from "sweetalert2";
const {
  LOGIN_API, SIGNUP_API_API, GET_ALL_USER_API, MY_PROFILE, CHANGE_USER_TYPE, EDIT_USER_PERMISSION_API, DELETE_USER,
  FORGOT_PASSWORD_API, VERIFY_RESET_OTP_API, RESET_PASSWORD_API, SEND_PHONE_VERIFICATION_OTP_API, VERIFY_PHONE_OTP_API,
  CHANGE_PASSWORD_API, GENERATE_REFERRAL_CODE_API
} = endpoints;

export async function login(phone, password, dispatch) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", LOGIN_API, {
      phone,
      password,
    });
    Swal.close();
    if (!response?.data?.success) {
      await Swal.fire({
        title: "Login Failed",
        text: response.data.message,
        icon: "error",
      });
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Login Successfully!`,
      text: `Have a nice day!`,
      icon: "success",
    });
    dispatch(setToken(response?.data?.token));
    dispatch(setUser(response.data.user));
  } catch (error) {
    console.log("LOGIN API ERROR............", error);
    Swal.fire({
      title: "Login Failed",
      text:
        error.response?.data?.message ||
        "Something went wrong, please try again later",
      icon: "error",
    });
  }
}
export async function signUp(formData) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", SIGNUP_API_API, formData);
    Swal.close();
    if (!response?.data?.success) {
      await Swal.fire({
        title: "Registration Failed",
        text: response.data.message,
        icon: "error",
      });
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Account created successfully!`,
      text: `Welcome to MeraGharSansaar!`,
      icon: "success",
    });

    return response?.data;
  } catch (error) {
    console.log("sign  API ERROR............", error);
    Swal.fire({
      title: "Register Failed",
      text:
        error.response?.data?.message ||
        "Something went wrong, please try again later",
      icon: "error",
    });
    return null;
  }
}


export const getAllUsersAPI = async (page = 1, limit = 10, search = "", token) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search
    });
    
    const response = await apiConnector(
      "GET", 
      `${GET_ALL_USER_API}?${params.toString()}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return {
      users: response?.data?.users || [],
      pagination: response?.data?.pagination || {}
    };
  } catch (error) {
    console.error("GET users API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get users!");
    return { users: [], pagination: {} };
  }
};
export const getUserProfile = async (id) => {

  try {
    const response = await apiConnector("GET", `${MY_PROFILE}/${id}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data || [];
  } catch (error) {
    console.error("GET users API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get users !");
    return [];
  }
};


export const changeUserType = async (id, type) => {
  try {
    const response = await apiConnector("PUT", `${CHANGE_USER_TYPE}/${id}`, { type });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success("User type changed successfully!");
    return response?.data;
  } catch (error) {
    console.error("CHANGE_USER_TYPE API ERROR:", error);
    return null;
  }
};


export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null));
    dispatch(setUser(null));

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire({
      title: `User Logout Succesfull!`,
      text: `Have a nice day!`,
      icon: "success",
    });
    navigate("/");
  };
}



export const editPermissionAPI = async (id, dataToUpdate) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("PUT", `${EDIT_USER_PERMISSION_API}/${id}`, dataToUpdate);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("permission API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to update permission!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};
export const deleteUserAPI = async (id) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("DELETE", `${DELETE_USER}/${id}`);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("delete user API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to delete user!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};

// Forgot Password Functions
export const forgotPassword = async (phone, otpMethod = 'sms') => {
  const toastId = toast.loading("Sending OTP...");

  try {
    const response = await apiConnector("POST", FORGOT_PASSWORD_API, {
      phone,
      otpMethod
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "OTP sent successfully!");
    return response?.data;
  } catch (error) {
    console.error("FORGOT PASSWORD API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to send OTP!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const verifyResetOTP = async (phone, otp) => {
  const toastId = toast.loading("Verifying OTP...");

  try {
    const response = await apiConnector("POST", VERIFY_RESET_OTP_API, {
      phone,
      otp
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "OTP verified successfully!");
    return response?.data;
  } catch (error) {
    console.error("VERIFY RESET OTP API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to verify OTP!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const resetPassword = async (resetToken, newPassword) => {
  const toastId = toast.loading("Resetting password...");

  try {
    const response = await apiConnector("POST", RESET_PASSWORD_API, {
      resetToken,
      newPassword
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Password reset successfully!");
    return response?.data;
  } catch (error) {
    console.error("RESET PASSWORD API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reset password!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Vendor Forgot Password Functions
export const vendorForgotPassword = async (phone, otpMethod = 'sms') => {
  const toastId = toast.loading("Sending OTP...");

  try {
    const response = await apiConnector("POST", vendor.FORGOT_PASSWORD_API, {
      phone,
      otpMethod
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "OTP sent successfully!");
    return response?.data;
  } catch (error) {
    console.error("VENDOR FORGOT PASSWORD API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to send OTP!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const vendorVerifyResetOTP = async (phone, otp) => {
  const toastId = toast.loading("Verifying OTP...");

  try {
    const response = await apiConnector("POST", vendor.VERIFY_RESET_OTP_API, {
      phone,
      otp
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "OTP verified successfully!");
    return response?.data;
  } catch (error) {
    console.error("VENDOR VERIFY RESET OTP API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to verify OTP!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const vendorResetPassword = async (resetToken, newPassword) => {
  const toastId = toast.loading("Resetting password...");

  try {
    const response = await apiConnector("POST", vendor.RESET_PASSWORD_API, {
      resetToken,
      newPassword
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Password reset successfully!");
    return response?.data;
  } catch (error) {
    console.error("VENDOR RESET PASSWORD API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reset password!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};


// Phone Verification Functions
export const sendPhoneVerificationOTP = async (userId, otpMethod = 'whatsapp') => {
  const toastId = toast.loading("Sending verification OTP...");

  try {
    const response = await apiConnector("POST", SEND_PHONE_VERIFICATION_OTP_API, {
      userId,
      otpMethod
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Verification OTP sent successfully!");
    return response?.data;
  } catch (error) {
    console.error("SEND PHONE VERIFICATION OTP API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to send verification OTP!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const verifyPhoneOTP = async (userId, otp) => {
  const toastId = toast.loading("Verifying phone number...");

  try {
    const response = await apiConnector("POST", VERIFY_PHONE_OTP_API, {
      userId,
      otp
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message || "Phone number verified successfully!");
    return response?.data;
  } catch (error) {
    console.error("VERIFY PHONE OTP API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to verify phone number!");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const updateUserProfileAPI = async (id, dataToUpdate) => {
  const toastId = toast.loading("Updating profile...");
  try {
    const response = await apiConnector("PUT", `${EDIT_USER_PERMISSION_API}/${id}`, dataToUpdate);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to update profile");
    }
    toast.success(response?.data?.message || "Profile updated successfully!");
    return response?.data;
  } catch (error) {
    console.error("UPDATE USER PROFILE API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to update profile");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const changePasswordAPI = async (id, data) => {
  const toastId = toast.loading("Changing password...");
  try {
    const response = await apiConnector("PUT", `${CHANGE_PASSWORD_API}/${id}`, data);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to change password");
    }
    toast.success(response?.data?.message || "Password changed successfully!");
    return response?.data;
  } catch (error) {
    console.error("CHANGE PASSWORD API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to change password");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const generateReferralCodeAPI = async (userId, token) => {
  const toastId = toast.loading("Generating referral code...");
  try {
    const response = await apiConnector(
      "POST",
      GENERATE_REFERRAL_CODE_API,
      { userId },
      { Authorization: `Bearer ${token}` }
    );
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to generate referral code");
    }
    toast.success(response?.data?.message || "Referral code generated successfully!");
    return response?.data;
  } catch (error) {
    console.error("GENERATE REFERRAL CODE API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to generate referral code");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

