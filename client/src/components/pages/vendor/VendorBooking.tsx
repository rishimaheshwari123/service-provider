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

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Calendar, Clock, MapPin, Phone, User, Search, Loader2 } from "lucide-react";

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
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const { user, token } = useSelector((state: RootState) => state.auth);

  /**
   * Fetches all bookings for the vendor.
   * Uses useCallback for memoization, though it's mainly used inside useEffect.
   */
  const fetchVendorBookings = useCallback(async () => {
    // Early exit if crucial data is missing
    if (!token || !user?._id) {
      return;
    }

    setLoading(true);
    try {
      // API call with proper typing/error handling
      const data: ExtendedBooking[] = await getVendorAllBookingAPI(user._id, token);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching vendor bookings:", error);
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
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

  /**
   * Handles the update of a booking's payment status.
   * @param bookingId The ID of the booking to update.
   * @param newPaymentStatus The new payment status to set.
   */
  const handlePaymentStatusChange = async (
    bookingId: string,
    newPaymentStatus: ExtendedBooking["payment"]["paymentStatus"],
  ) => {
    try {
      const response = await updateBookingStatusAPI(bookingId, { paymentStatus: newPaymentStatus });

      if (response) {
        toast.success("Payment status updated successfully!");

        // Update local state immutably
        setBookings((prevBookings) =>
          prevBookings.map((b) => {
            if (b._id === bookingId) {
              return {
                ...b,
                payment: {
                  ...b.payment,
                  paymentStatus: newPaymentStatus,
                  paymentType: newPaymentStatus === "success" && !b.payment.paymentType ? "cash" : b.payment.paymentType
                }
              };
            }
            return b;
          }),
        );
      } else {
        toast.error("Failed to update payment status.");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("An error occurred while updating payment status.");
    }
  };

  // High-performance client-side filtering and searching
  const filteredBookings = bookings.filter((booking) => {
    // Search Term Filter (matches service title, customer name, email, phone, location)
    const matchesSearch =
      !searchTerm ||
      booking.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status Filter
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    // Payment Filter
    const matchesPayment =
      paymentFilter === "all" || booking.payment?.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // --- JSX Rendering ---

  return (
    <div className="w-full max-w-full px-1 sm:px-4 py-0 md:pr-4 md:ml-4 space-y-6 min-h-screen flex flex-col font-inter overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendor Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your service bookings, client requests, and payments.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Search Input (Form wrapper to support Enter key submission) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchTerm(searchInput);
          }}
          className="sm:col-span-2"
        >
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Search Bookings
          </label>
          <div className="flex gap-2 relative">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-[12px] text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search service, customer, or location..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchTerm("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition duration-150 flex-shrink-0 flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

        {/* Status Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Booking Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full border rounded-lg h-10 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Payment Status
          </label>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full border rounded-lg h-10 text-sm">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="success">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mr-2" />
          <span className="text-gray-600 font-medium">Loading bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-lg text-gray-500 font-semibold">
            No bookings found.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search query or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <Card
              key={booking._id}
              className="overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition duration-200 flex flex-col sm:flex-row bg-white rounded-xl"
            >
              {/* Left Side: Service Image (Nicely compact size) */}
              <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 bg-gray-50">
                {booking.service?.images?.[0]?.url ? (
                  <img
                    src={booking.service.images[0].url}
                    alt={booking.service.title || "Service Image"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Briefcase className="w-8 h-8" />
                  </div>
                )}
                {/* Status Badge floating on image for mobile view */}
                <div className="absolute top-2 left-2 sm:hidden">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${booking.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Right Side: Flex-grow body containing the info split into nice compact sections */}
              <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                {/* Top Row: Service Name + Price */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 min-w-0 w-full">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 break-words whitespace-normal">
                      {booking.service?.title || "Unnamed Service"}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-start gap-1 mt-1 break-words whitespace-normal">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="break-words whitespace-normal text-left">{booking.service?.location || "Location N/A"}</span>
                    </p>
                  </div>
                  {/* <div className="text-left sm:text-right mt-1 sm:mt-0 flex-shrink-0">
                    <span className="text-lg font-black text-green-600 block">
                      ₹{booking.service?.price.toLocaleString("en-IN") || "0"}
                    </span>
                  </div> */}
                </div>

                {/* Middle Row: Date, Time & Customer info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-b py-2 border-gray-100">
                  {/* Left Column: Schedule */}
                  <div className="space-y-1 text-gray-700">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>{formatDate(booking.date)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>{formatTime12Hour(booking.time)}</span>
                    </p>
                  </div>

                  {/* Right Column: Booked By */}
                  <div className="space-y-1 text-gray-700 text-left">
                    <p className="flex items-center gap-1.5 font-medium text-gray-800">
                      <User className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{booking.user?.name || "Customer"}</span>
                    </p>
                    {booking.user?.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <a href={`tel:${booking.user.phone}`} className="hover:underline text-blue-600">
                          {booking.user.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Address & Notes (Older/New Booking Address details) */}
                {booking.address ? (
                  <div className="p-2 bg-blue-50/50 rounded border border-blue-100 text-[11px] text-gray-700">
                    <p className="font-semibold text-gray-800 mb-0.5 flex items-center gap-1">
                      <span>📍</span> Service Address:
                    </p>
                    <p className="truncate">
                      {booking.address.addressLine1}
                      {booking.address.city && `, ${booking.address.city}`}
                      {booking.address.state && `, ${booking.address.state}`}
                      {booking.address.zipCode && ` - ${booking.address.zipCode}`}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 rounded border border-gray-100 text-[11px] text-gray-500 italic">
                    📍 Address not provided (older booking)
                  </div>
                )}

                {/* Bottom Row: Action controllers */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-50">
                  {/* Payment Info Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment:</span>
                    <select
                      value={booking.payment?.paymentStatus || "pending"}
                      onChange={(e) =>
                        handlePaymentStatusChange(
                          booking._id,
                          e.target.value as ExtendedBooking["payment"]["paymentStatus"],
                        )
                      }
                      className={`border border-gray-300 bg-white rounded px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 cursor-pointer hover:border-gray-400 text-gray-800`}
                    >
                      <option value="pending">Pending</option>
                      <option value="success">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Status Dropdown Controller */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status:</span>
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(
                          booking._id,
                          e.target.value as ExtendedBooking["status"],
                        )
                      }
                      className={`border border-gray-300 bg-white rounded px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${booking.status === "completed" ? "bg-gray-100 cursor-not-allowed opacity-80" : "cursor-pointer hover:border-gray-400"
                        }`}
                      disabled={booking.status === "completed"}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Additional Info / Note (Compact text at bottom if exists) */}
                {booking.notes && (
                  <div className="text-[11px] text-gray-500 italic bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-start gap-1">
                    <span className="flex-shrink-0">📝</span>
                    <span className="line-clamp-2">{booking.notes}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
