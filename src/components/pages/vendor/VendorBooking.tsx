import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// Type Imports
import type { RootState } from "@/redux/store";
import type { Booking } from "@/types/booking"; // Assuming you have a Booking type

// Service Imports
import {
  getVendorAllBookingAPI,
  updateBookingStatusAPI,
} from "@/service/operations/booking";

// --- Type Definitions for this file ---
// Define a type for the structure you expect for a single booking item
// It extends the base Booking type (or can be defined fully here if no external type exists)
interface ExtendedBooking extends Booking {
  _id: string; // Assuming the ID is present
  service: {
    title: string;
    location: string;
    price: number;
    images: { url: string }[];
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  time: string;
  notes: string;
  address?: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment: {
    paymentStatus: "success" | "pending" | "failed";
    paymentType: string;
  };
}

// --- Utility Functions ---

/**
 * Formats an ISO date string into a readable date format.
 * @param dateStr The date string to format.
 * @returns The formatted date string or '-' if invalid.
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const dateObj = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return dateObj.toLocaleDateString(undefined, options);
  } catch {
    return "-";
  }
};

/**
 * Converts a 24-hour time string (HH:MM) to 12-hour format (H:MM AM/PM).
 * @param timeStr The time string (e.g., "14:30").
 * @returns The formatted 12-hour time string or '-' if invalid.
 */
const formatTime12Hour = (timeStr: string): string => {
  if (!timeStr) return "-";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour) || !minute) return "-";

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${hour}:${minute} ${ampm}`;
};

// --- React Component ---

const VendorBookings: React.FC = () => {
  // Use the defined type for state
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const { user, token } = useSelector((state: RootState) => state.auth);

  /**
   * Fetches all bookings for the vendor.
   * Uses useCallback for memoization, though it's mainly used inside useEffect.
   */
  const fetchVendorBookings = useCallback(async () => {
    // Early exit if crucial data is missing
    if (!token || !user?._id) {
      // toast.info is commented out here to prevent repeated toasts on initial load/state change
      // if (!token) toast.info("Please login to view bookings.");
      return;
    }

    try {
      // API call with proper typing/error handling
      const data: ExtendedBooking[] = await getVendorAllBookingAPI(user._id);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching vendor bookings:", error);
      toast.error("Failed to load bookings.");
    }
  }, [token, user?._id]); // Depend on token and user._id

  // Initial fetch of bookings
  useEffect(() => {
    fetchVendorBookings();
  }, [fetchVendorBookings]); // Re-run when fetchVendorBookings changes (i.e., when dependencies change)

  /**
   * Handles the update of a booking's status.
   * @param bookingId The ID of the booking to update.
   * @param newStatus The new status to set.
   */
  const handleStatusChange = async (
    bookingId: string,
    newStatus: ExtendedBooking["status"],
  ) => {
    try {
      const response = await updateBookingStatusAPI(bookingId, newStatus);

      // Check if the API call was successful (assuming it returns a truthy value on success)
      if (response) {
        toast.success("Booking status updated successfully!");

        // Update local state immutably
        setBookings((prevBookings) =>
          prevBookings.map((b) => {
            if (b._id === bookingId) {
              // Logic to update payment status on 'completed' status change
              const updatedPayment =
                newStatus === "completed"
                  ? {
                      ...b.payment,
                      paymentStatus: "success" as const, // Use 'as const' for literal types
                      paymentType: "cash",
                    }
                  : b.payment;

              return {
                ...b,
                status: newStatus,
                payment: updatedPayment,
              };
            }
            return b;
          }),
        );
      } else {
        toast.error("Failed to update booking status.");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("An error occurred while updating status.");
    }
  };

  // --- JSX Rendering ---

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
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              {/* Property Image/Placeholder */}
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

              {/* Booking Details */}
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

                {/* User and Time Details */}
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Booked by:
                    </span>{" "}
                    {booking.user?.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    {booking.user?.email ? (
                      <a
                        href={`mailto:${booking.user.email}`}
                        className="text-blue-500 hover:underline"
                      >
                        {booking.user.email}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                  {booking.user?.phone && (
                    <p>
                      <span className="font-semibold text-gray-900">
                        Phone:
                      </span>{" "}
                      <a
                        href={`tel:${booking.user.phone}`}
                        className="text-blue-500 hover:underline"
                      >
                        {booking.user.phone}
                      </a>
                    </p>
                  )}
                  <p className="mt-2">
                    <span className="font-semibold text-gray-900">Date:</span>{" "}
                    {formatDate(booking.date)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Time:</span>{" "}
                    {formatTime12Hour(booking.time)}
                  </p>

                  {/* Service Address */}
                  {booking.address ? (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">📍</span>
                        Service Address:
                      </p>
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>{booking.address.addressLine1}</p>
                        {booking.address.city && (
                          <p>
                            {booking.address.city}
                            {booking.address.state &&
                              `, ${booking.address.state}`}
                            {booking.address.zipCode &&
                              ` - ${booking.address.zipCode}`}
                          </p>
                        )}
                        {booking.address.country && (
                          <p className="font-medium">
                            {booking.address.country}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-700 mb-1 flex items-center">
                        <span className="mr-2">📍</span>
                        Service Address:
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        Address not provided (older booking)
                      </p>
                    </div>
                  )}

                  <p className="mt-2">
                    <span className="font-semibold text-gray-900">Notes:</span>{" "}
                    <span className="italic">{booking.notes || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Status and Actions (Footer) */}
              <div className="p-5 border-t bg-gray-50 space-y-3">
                {/* Booking Status Dropdown */}
                {/* Booking Status Dropdown */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">Status:</span>{" "}
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      handleStatusChange(
                        booking._id,
                        e.target.value as ExtendedBooking["status"],
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

                {/* Payment Status Badge */}
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

export default VendorBookings;
