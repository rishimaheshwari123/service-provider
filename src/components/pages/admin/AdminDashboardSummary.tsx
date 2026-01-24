import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllBookingAPI } from "@/service/operations/booking";
import { Loader2 } from "lucide-react";

interface Booking {
  _id: string;
  service: {
    price: string | number; 
  };
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const AdminDashboardSummary: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getAllBookingAPI();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Total bookings
  const totalBookings = bookings.length;

  // Total revenue only from completed bookings
  const totalRevenue = bookings
    .filter((b) => b.status === "completed" && b.service?.price)
    .reduce((sum, b) => {
      const numericPrice = Number(String(b.service.price).replace(/,/g, ""));
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500 mr-2" />
          <span className="text-gray-600 text-sm">Loading data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-6 rounded-xl shadow-sm text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Bookings
            </h2>
            <p className="text-3xl font-extrabold text-indigo-700 mt-2">
              {totalBookings}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl shadow-sm text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Revenue
            </h2>
            <p className="text-3xl font-extrabold text-green-700 mt-2">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardSummary;
