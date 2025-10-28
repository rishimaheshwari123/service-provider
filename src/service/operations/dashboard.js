import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { dashboar } from "../apis";

const { ADMIN_DASHBOARD_DATA, VENDOR_DASHBOARD_DATA } = dashboar;

// ✅ Admin Dashboard Data
export const getAdminDashboardData = async () => {
  try {
    const response = await apiConnector("GET", `${ADMIN_DASHBOARD_DATA}`);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    // return all counts
    return response?.data?.data || {};
  } catch (error) {
    console.error("GET ADMIN DASHBOARD DATA ERROR:", error);
    toast.error(
      error?.response?.data?.message || "Failed to get admin dashboard data!"
    );
    return {};
  }
};

// ✅ Vendor Dashboard Data
export const getVendorDashboardData = async (id) => {
  try {
    const response = await apiConnector("GET", `${VENDOR_DASHBOARD_DATA}/${id}`);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    // return all counts
    return response?.data?.data || {};
  } catch (error) {
    console.error("GET VENDOR DASHBOARD DATA ERROR:", error);
    toast.error(
      error?.response?.data?.message || "Failed to get vendor dashboard data!"
    );
    return {};
  }
};
