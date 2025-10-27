import { toast } from "react-toastify";
import { setUser, setToken } from "../../redux/authSlice";
import { apiConnector } from "../apiConnector";
import { vendor } from "../apis";
import Swal from "sweetalert2";
const {
  LOGIN_API,
  SIGNUP_API,
  GET_ALL_VENDOR,
  UPDATE_VENDOR,
  GET_VENDOR,
  UPDATE_VENDOR_PROFILE,
  UPDATE_VENDOR_PERSANTAGE
} = vendor;

export async function login(email, password, dispatch) {
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
      email,
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

export async function signUp(formData,) {
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
    const response = await apiConnector("POST", SIGNUP_API, formData);

    console.log("SIGNUP API RESPONSE............", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `User Register Succesfull!`,
      text: `Have a nice day!`,
      icon: "success",
    });

    // dispatch(setToken(response?.data?.token));
    // dispatch(setUser(response?.data?.user));



    return response?.data?.success;
  } catch (error) {
    console.log("SIGNUP API ERROR............", error);

    // toast.error(error.response?.data?.message)
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Something went wrong. Please try again later.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }

  // Close the loading alert after completion
  // Swal.close();
}

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


export const getAllVendorAPI = async () => {

  try {
    const response = await apiConnector("GET", GET_ALL_VENDOR,)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.vendors || [];
  } catch (error) {
    console.error("GET vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor!");
    return [];
  }

};
export const getVendorByIdAPI = async (id) => {

  try {
    const response = await apiConnector("GET", `${GET_VENDOR}/${id}`,)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.vendor || [];
  } catch (error) {
    console.error("GET vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor!");
    return [];
  }

};


export const updateVendorStatusAPI = async (id, action) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_VENDOR}/${id}`, { status: action });


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("UPDATE Vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to vendor product!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};
export const updateVendorPersentageAPI = async (id, action) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_VENDOR_PERSANTAGE}/${id}`, { percentage: action });


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("UPDATE Vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to vendor percentage!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};
export const updateVendorProfileAPI = async (id, data) => {

  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("PUT", `${UPDATE_VENDOR_PROFILE}/${id}`, data);


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message)
    return response?.data;
  } catch (error) {
    console.error("UPDATE Vendor API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to vendor product!");
    return [];
  } finally {
    toast.dismiss(toastId);
  }

};