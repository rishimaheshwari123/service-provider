import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { booking } from "../apis";

const { CREATE_BOOKING, GET_ALL_BOOKINGS, GET_VENDOR_ALL_BOOKINGS, UPDATE_BOOKING_STATUS_BOOKINGS } = booking;

// ✅ Create Booking
export const createBookingAPI = async (formDataToSend) => {
  const toastId = toast.loading("Creating booking...");

  try {
    const response = await apiConnector("POST", CREATE_BOOKING, formDataToSend);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message);
    return response?.data?.booking; // Return created booking
  } catch (error) {
    console.error("CREATE BOOKING API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to create booking!");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// ✅ Get All Bookings (Admin or All Users)
export const getAllBookingAPI = async () => {
  try {
    const response = await apiConnector("GET", GET_ALL_BOOKINGS);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.bookings || [];
  } catch (error) {
    console.error("GET ALL BOOKINGS API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get bookings!");
    return [];
  }
};

// ✅ Get All Bookings by Vendor ID
export const getVendorAllBookingAPI = async (vendorId) => {
  try {
    const response = await apiConnector("GET", `${GET_VENDOR_ALL_BOOKINGS}/${vendorId}`);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.bookings || [];
  } catch (error) {
    console.error("GET VENDOR BOOKINGS API ERROR:", error);
    // toast.error(error?.response?.data?.message || "Failed to get vendor bookings!");
    return [];
  }
};
export const updateBookingStatusAPI = async (bookingId, status) => {
  try {
    const response = await apiConnector("PUT", `${UPDATE_BOOKING_STATUS_BOOKINGS}/${bookingId}`, { status });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response?.data?.bookings || [];
  } catch (error) {
    console.error("GET VENDOR BOOKINGS API ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to get vendor bookings!");
    return [];
  }
};
