import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { RootState } from "@/redux/store";
import { getVendorAllBookingAPI } from "@/service/operations/booking";

interface Booking {
  _id: string;
  service: {
    price: string | number; // 👈 updated type to handle both string & number
  };
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const DashboardSummary: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const fetchBookings = useCallback(async () => {
    if (!token || !user?._id) return;
    try {
      const data: Booking[] = await getVendorAllBookingAPI(user._id, token);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load booking summary.");
    }
  }, [token, user?._id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const totalBookings = bookings.length;

  // ✅ Convert price to number before summing
  const totalEarnings = bookings
    .filter((b) => b.status === "completed" && b.service?.price)
    .reduce((sum, b) => {
      const numericPrice = Number(String(b.service.price).replace(/,/g, ""));
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-indigo-50 p-5 rounded-xl shadow-sm text-center">
        <h2 className="text-lg font-semibold text-gray-700">Total Bookings</h2>
        <p className="text-3xl font-extrabold text-indigo-700 mt-2">
          {totalBookings}
        </p>
      </div>

      <div className="bg-green-50 p-5 rounded-xl shadow-sm text-center">
        <h2 className="text-lg font-semibold text-gray-700">Total Earnings</h2>
        <p className="text-3xl font-extrabold text-green-700 mt-2">
          ₹{totalEarnings.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
};

export default DashboardSummary;
