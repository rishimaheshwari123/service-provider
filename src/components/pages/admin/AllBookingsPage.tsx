import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllBookingAPI, updateBookingStatusAPI } from "@/service/operations/booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Booking {
  _id: string;
  user: {
    _id?: string;
    name: string;
    email: string;
  };
  service: {
    title: string;
    price: number;
    location: string;
    type: string;
    category: string;
    images: { url: string }[];
    vendor: {
      name: string;
      email: string;
      phone: string;
      company: string;
    };
  };
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment: {
    paymentStatus: "success" | "pending" | "failed";
    paymentType: string;
  };
  notes?: string;
}

const AllBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBookings, setTotalBookings] = useState<number>(0);

  // Custom Pagination state
  const [limit, setLimit] = useState<number>(10);
  const [showCustomPageSize, setShowCustomPageSize] = useState<boolean>(false);
  const [customPageSizeInput, setCustomPageSizeInput] = useState<string>("");

  // Search & Filter States
  const [searchInput, setSearchInput] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const handleBookingStatusUpdate = async (
    bookingId: string,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    try {
      const response = await updateBookingStatusAPI(bookingId, newStatus);

      if (response) {
        toast.success("Booking status updated successfully!");

        setBookings((prevBookings) =>
          prevBookings.map((b) => {
            if (b._id === bookingId) {
              const updatedPayment =
                newStatus === "completed"
                  ? {
                    ...b.payment,
                    paymentStatus: "success" as const,
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
          })
        );
      } else {
        toast.error("Failed to update booking status.");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("An error occurred while updating status.");
    }
  };

  const handleBookingPaymentStatusUpdate = async (
    bookingId: string,
    newPaymentStatus: "pending" | "success" | "failed"
  ) => {
    try {
      const response = await updateBookingStatusAPI(bookingId, { paymentStatus: newPaymentStatus });

      if (response) {
        toast.success("Payment status updated successfully!");

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
          })
        );
      } else {
        toast.error("Failed to update payment status.");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("An error occurred while updating payment status.");
    }
  };

  // Safe price formatter to eliminate ₹NaN rendering
  const formatPrice = (priceVal: any): string => {
    if (priceVal === undefined || priceVal === null || priceVal === "") return "0";
    const cleaned = String(priceVal).replace(/[^\d.]/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? "0" : num.toLocaleString("en-IN");
  };

  // Trigger search on button click or Enter key
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };

  // Immediate clear search input and query
  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  // Handle status select change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Handle payment status select change
  const handlePaymentStatusChange = (paymentStatus: string) => {
    setSelectedPaymentStatus(paymentStatus);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const isInitialLoad = bookings.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const token = (user as any)?.token;
        const response = await getAllBookingAPI(
          currentPage,
          limit,
          activeSearch,
          selectedStatus,
          selectedPaymentStatus,
          token
        );
        if (response && response.bookings) {
          setBookings(response.bookings);
          setTotalPages(response.totalPages || 1);
          setTotalBookings(response.total || 0);
        } else {
          setBookings([]);
          setTotalPages(1);
          setTotalBookings(0);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchBookings();
  }, [currentPage, activeSearch, selectedStatus, selectedPaymentStatus, limit]);

  const downloadBookingsPDF = async () => {
    const toastId = toast.loading("Generating PDF Report...");
    try {
      const token = (user as any)?.token;
      const allBookings = await getAllBookingAPI(
        undefined,
        undefined,
        activeSearch,
        selectedStatus,
        selectedPaymentStatus,
        token
      );

      if (!allBookings || allBookings.length === 0) {
        toast.error("No bookings found to generate report.");
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("All Bookings Report", 14, 15);

      const tableColumn = [
        "Service",
        "User",
        "Vendor",
        "Date",
        "Time",
        "Price",
        "Payment",
        "Status",
      ];

      const tableRows: any[] = [];

      allBookings.forEach((b) => {
        const row = [
          b.service?.title || "-",
          `${b.user?.name || "-"}\n${b.user?.email || "-"}`,
          `${b.service?.vendor?.name || "-"} (${b.service?.vendor?.company || "-"})\n${b.service?.vendor?.phone || "-"}`,
          formatDate(b.date),
          formatTime(b.time),
          `${formatPrice(b.service?.price)}`,
          `${b.payment?.paymentStatus} (${b.payment?.paymentType})`,
          b.status,
        ];

        tableRows.push(row);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 40, 140] },
      });

      doc.save(`all-bookings-${Date.now()}.pdf`);
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate bookings PDF:", error);
      toast.error("Failed to generate PDF report.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  if (!user?.isBooking) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }
  return (
    <div className="w-full max-w-full px-1 sm:px-4 md:pr-4 md:ml-4 space-y-6 min-h-screen flex flex-col font-inter overflow-x-hidden">
      {refreshing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-sm text-gray-600 font-medium">Loading bookings...</p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage, search, and download reports for your partner service bookings
          </p>
        </div>
        <button
          onClick={downloadBookingsPDF}
          className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-indigo-700 transition duration-150"
        >
          Download Bookings PDF
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl border shadow-sm">
        {/* Search Field (Form wrapper to support Enter submission) */}
        <form onSubmit={handleSearchSubmit} className="sm:col-span-2 lg:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Search Bookings
          </label>
          <div className="flex gap-2 relative">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder=" Search Booking.."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition duration-150"
            >
              Search
            </button>
          </div>
        </form>

        {/* Status Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Filter Status
          </label>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full border rounded-lg">
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
          <Select value={selectedPaymentStatus} onValueChange={handlePaymentStatusChange}>
            <SelectTrigger className="w-full border rounded-lg">
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
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500 mr-2" />
          <span className="text-gray-600 text-sm">Loading bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-medium">
          No bookings found.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <Card
              key={b._id}
              className="overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition duration-200 flex flex-col sm:flex-row bg-white rounded-xl"
            >
              {/* Left Side: Service Image (Nicely compact size) */}
              <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 bg-gray-50">
                <img
                  src={
                    b.service?.images?.[0]?.url ||
                    "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={b.service?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Side: Flex-grow body containing the info split into nice compact sections */}
              <div className="p-4 flex flex-col justify-between flex-grow gap-3 text-left">
                {/* Top Row: Service Name + Price + Status Select */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 min-w-0 w-full">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 break-words whitespace-normal">
                      {b.service?.title || "Unnamed Service"}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-start gap-1 mt-1 break-words whitespace-normal">
                      <span className="text-gray-400 mt-0.5 flex-shrink-0">📍</span>
                      <span className="break-words whitespace-normal text-left">{b.service?.location || "Location N/A"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end flex-shrink-0">
                    {/* <span className="text-lg font-black text-green-600">
                      ₹{formatPrice(b.service?.price)}
                    </span> */}
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleBookingStatusUpdate(
                          b._id,
                          e.target.value as "pending" | "confirmed" | "completed" | "cancelled"
                        )
                      }
                      className={`border rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 cursor-pointer shadow-sm ${b.status === "completed"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : b.status === "confirmed"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : b.status === "cancelled"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Middle Row: Date, Time & Customer info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-b py-2 border-gray-100">
                  {/* Left Column: Schedule & Customer */}
                  <div className="space-y-1 text-gray-700">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 w-12">Date:</span>
                      <span>{formatDate(b.date)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 w-12">Time:</span>
                      <span>{formatTime(b.time)}</span>
                    </p>
                    <p className="flex items-center gap-1.5 pt-1 border-t border-dashed border-gray-100 mt-1">
                      <span className="font-semibold text-gray-900 w-12">User:</span>
                      <span className="truncate">{b.user?.name || "Customer"}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 truncate ml-[54px]">{b.user?.email}</p>
                  </div>

                  {/* Right Column: Vendor Info */}
                  <div className="space-y-1 text-gray-700 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-3 border-gray-100">
                    <p className="font-bold text-gray-900 uppercase tracking-wide text-[10px] text-gray-400 mb-1">
                      Vendor Details
                    </p>
                    <p className="truncate font-medium text-gray-800">
                      {b.service?.vendor?.name || "No Name"}
                    </p>
                    {b.service?.vendor?.company && (
                      <p className="text-gray-500 truncate">
                        🏢 {b.service.vendor.company}
                      </p>
                    )}
                    {b.service?.vendor?.phone && (
                      <p className="text-gray-500">
                        📞 <a href={`tel:${b.service.vendor.phone}`} className="hover:underline text-blue-600">{b.service.vendor.phone}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Address & Notes */}
                {b.notes && (
                  <div className="text-[11px] text-gray-500 italic bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-start gap-1">
                    <span className="flex-shrink-0">📝</span>
                    <span className="line-clamp-2">{b.notes}</span>
                  </div>
                )}

                {/* Bottom Row: Payment status select */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment:</span>
                    <select
                      value={b.payment?.paymentStatus || "pending"}
                      onChange={(e) =>
                        handleBookingPaymentStatusUpdate(
                          b._id,
                          e.target.value as "pending" | "success" | "failed"
                        )
                      }
                      className="border border-gray-300 bg-white rounded px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 cursor-pointer hover:border-gray-400 text-gray-800"
                    >
                      <option value="pending">Pending</option>
                      <option value="success">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                    {b.payment?.paymentType && (
                      <span className="text-[10px] text-gray-400 capitalize">
                        ({b.payment.paymentType})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t px-2">
          {/* Left Info */}
          <p className="text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1">
            Page {currentPage} of {totalPages} &bull; {totalBookings} total bookings
          </p>

          {/* Center: Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (totalPages > 5) {
                    const showEllipsisBefore = page === 2 && currentPage > 3;
                    const showEllipsisAfter = page === totalPages - 1 && currentPage < totalPages - 2;

                    if (showEllipsisBefore) {
                      return <span key="ellipsis-before" className="px-2 text-gray-400">...</span>;
                    }
                    if (showEllipsisAfter) {
                      return <span key="ellipsis-after" className="px-2 text-gray-400">...</span>;
                    }

                    const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    if (!isVisible) return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`w-8 h-8 p-0 text-xs ${currentPage === page ? "bg-indigo-600 text-white" : ""}`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="h-8 px-2.5"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Right: Rows per page dropdown */}
          <div className="flex items-center gap-2 order-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">Rows per page:</span>
            <Select
              value={showCustomPageSize ? "custom" : (limit >= 99999 ? "all" : String(limit))}
              onValueChange={(value) => {
                if (value === "custom") {
                  setShowCustomPageSize(true);
                } else if (value === "all") {
                  setShowCustomPageSize(false);
                  setCustomPageSizeInput("");
                  setLimit(99999);
                  setCurrentPage(1);
                } else {
                  setShowCustomPageSize(false);
                  setCustomPageSizeInput("");
                  const size = parseInt(value);
                  if (limit !== size) {
                    setLimit(size);
                    setCurrentPage(1);
                  }
                }
              }}
            >
              <SelectTrigger className="w-[90px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {showCustomPageSize && (
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="e.g. 25"
                  value={customPageSizeInput}
                  onChange={(e) => setCustomPageSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(customPageSizeInput);
                      if (val && val > 0 && val <= 500) {
                        setLimit(val);
                        setCurrentPage(1);
                        setShowCustomPageSize(false);
                      }
                    }
                  }}
                  className="h-8 w-20 text-sm"
                />
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => {
                    const val = parseInt(customPageSizeInput);
                    if (val && val > 0 && val <= 500) {
                      setLimit(val);
                      setCurrentPage(1);
                      setShowCustomPageSize(false);
                    }
                  }}
                >
                  Go
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookingsPage;
