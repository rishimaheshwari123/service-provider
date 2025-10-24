import { toast } from "react-toastify";
import { setUser, setToken } from "../../redux/authSlice";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";
import Swal from "sweetalert2";
const {
  LOGIN_API, SIGNUP_API_API, GET_ALL_USER_API,
} = endpoints;

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
        title: "Login Failed",
        text: response.data.message,
        icon: "error",
      });
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Role created successfully!`,
      text: `Have a nice day!`,
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
  }
}


export const getAllUsersAPI = async () => {

  try {
    const response = await apiConnector("GET", `${GET_ALL_USER_API}`)


    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.users || [];
  } catch (error) {
    console.error("GET users API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get users !");
    return [];
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

