import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getVendorAllBookingAPI,
  updateBookingStatusAPI,
} from "@/service/operations/booking";
import type { RootState } from "@/redux/store";
import type { Booking } from "@/types/booking";
import { Loader2 } from "lucide-react";

// --- Type Definitions ---
interface ExtendedBooking extends Booking {
  _id: string;
  service: {
    title: string;
    location: string;
    price: number;
    images: { url: string }[];
  };
  user: {
    name: string;
    email: string;
  };
  date: string;
  time: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment: {
    paymentStatus: "success" | "pending" | "failed";
    paymentType: string;
  };
}

// --- Format Helpers ---
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatTime12Hour = (timeStr: string): string => {
  if (!timeStr) return "-";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour) || !minute) return "-";

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

// --- Component ---
const Task: React.FC = () => {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const fetchVendorBookings = useCallback(async () => {
    if (!token || !user?._id) return;
    setLoading(true);
    try {
      const data: ExtendedBooking[] = await getVendorAllBookingAPI(user._id);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching vendor bookings:", error);
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  useEffect(() => {
    fetchVendorBookings();
  }, [fetchVendorBookings]);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: ExtendedBooking["status"]
  ) => {
    try {
      const response = await updateBookingStatusAPI(bookingId, newStatus);
      if (response) {
        toast.success("Booking status updated successfully!");
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  status: newStatus,
                  payment:
                    newStatus === "completed"
                      ? {
                          ...b.payment,
                          paymentStatus: "success",
                          paymentType: "cash",
                        }
                      : b.payment,
                }
              : b
          )
        );
      } else {
        toast.error("Failed to update booking status.");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("An error occurred while updating status.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl text-center font-extrabold mb-8 text-gray-800 border-b pb-2">
        Your Task
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg shadow-inner">
          <p className="text-xl text-gray-500 font-medium">
            No bookings found yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Once a user books your service, it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 flex items-center space-x-3">
                    {booking.service?.images?.[0]?.url ? (
                      <img
                        src={booking.service.images[0].url}
                        alt="Service"
                        className="w-14 h-14 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                        No Img
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.service?.title || "Unnamed"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.service?.location || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {booking.user?.name}
                    </p>
                    <a
                      href={`mailto:${booking.user?.email}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {booking.user?.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatTime12Hour(booking.time)}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-bold">
                    ₹{booking.service?.price?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        booking.payment?.paymentStatus === "success"
                          ? "bg-green-500"
                          : booking.payment?.paymentStatus === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {booking.payment?.paymentStatus || "N/A"}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1 pr-20 text-center">
                      {booking.payment?.paymentType || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(
                          booking._id,
                          e.target.value as ExtendedBooking["status"]
                        )
                      }
                      className={`border border-gray-300 rounded-md text-xs px-2 py-1 ${
                        booking.status === "completed"
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-white"
                      }`}
                      disabled={booking.status === "completed"}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Task;
