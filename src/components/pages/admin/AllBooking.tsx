import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// Type Imports
import type { RootState } from "@/redux/store";
import type { Booking } from "@/types/booking";

// Service Imports
import {
  getVendorAllBookingAPI,
  updateBookingStatusAPI,
} from "@/service/operations/booking";

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

// Props interface for the component
interface AllBookingProps {
  user: { _id: string; name?: string };
}

// --- Utility Functions ---
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
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

// --- React Component ---
const AllBooking: React.FC<AllBookingProps> = ({ user }) => {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchVendorBookings = useCallback(async () => {
    if (!token || !user?._id) return;

    try {
      const data: ExtendedBooking[] = await getVendorAllBookingAPI(user._id);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching vendor bookings:", error);
      toast.error("Failed to load bookings.");
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
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
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
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-2">
        Vendor Bookings
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg shadow-inner">
          <p className="text-xl text-gray-500 font-medium">
            No bookings found yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Once a user books your service, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <div className="flex-shrink-0">
                {booking.service?.images?.[0]?.url ? (
                  <img
                    src={booking.service.images[0].url}
                    alt={booking.service.title || "Service Image"}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    [Image Not Available]
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow space-y-3">
                <h3 className="text-xl font-bold text-indigo-700">
                  {booking.service?.title || "Unnamed Service"}
                </h3>
                <p className="text-gray-600 text-sm">
                  📍 {booking.service?.location || "Location Not Specified"}
                </p>
                <p className="text-2xl font-extrabold text-green-600">
                  ₹{booking.service?.price.toLocaleString("en-IN") || "-"}
                </p>
                <hr className="my-2" />

                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Booked by:
                    </span>{" "}
                    {booking.user?.name || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    <a
                      href={`mailto:${booking.user?.email}`}
                      className="text-blue-500 hover:underline"
                    >
                      {booking.user?.email || "-"}
                    </a>
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-gray-900">Date:</span>{" "}
                    {formatDate(booking.date)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Time:</span>{" "}
                    {formatTime12Hour(booking.time)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Notes:</span>{" "}
                    <span className="italic">{booking.notes || "N/A"}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">Status:</span>
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      handleStatusChange(
                        booking._id,
                        e.target.value as ExtendedBooking["status"]
                      )
                    }
                    className={`border border-indigo-300 bg-white rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${
                      booking.status === "completed"
                        ? "bg-gray-200 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={booking.status === "completed"}
                    title={
                      booking.status === "completed"
                        ? "Booking already completed"
                        : ""
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">Payment:</span>
                  {booking.payment?.paymentStatus ? (
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${
                        booking.payment.paymentStatus === "success"
                          ? "bg-green-600"
                          : booking.payment.paymentStatus === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {`${booking.payment.paymentStatus} (${
                        booking.payment.paymentType || "Type N/A"
                      })`}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-gray-500">
                      Not Paid
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBooking;
