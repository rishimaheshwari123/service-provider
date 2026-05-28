import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllBookingAPI } from "@/service/operations/booking";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const limit = 9; // Grid display friendly

  // Search & Filter States
  const [searchInput, setSearchInput] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

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
      setLoading(true);
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
      }
    };

    fetchBookings();
  }, [currentPage, activeSearch, selectedStatus, selectedPaymentStatus]);

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
    <div className="max-w-7xl mx-auto p-6">
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
              <SelectItem value="success">Success</SelectItem>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => (
            <Card
              key={b._id}
              className="overflow-hidden shadow-md border hover:shadow-lg transition duration-200"
            >
              {/* Service Image */}
              <div className="relative">
                <img
                  src={
                    b.service?.images?.[0]?.url ||
                    "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={b.service?.title}
                  className="w-full h-48 object-cover"
                />
                <span
                  className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${b.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : b.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : b.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {b.status}
                </span>
              </div>

              <CardContent className="p-5 space-y-3">
                {/* Service Details */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {b.service?.title || "-"}
                  </h2>

                  <p className="text-sm text-gray-400">
                    📍 {b.service?.location}
                  </p>
                </div>

                {/* Vendor Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">
                    Vendor Info
                  </h3>
                  <p className="text-sm text-gray-700">
                    {b.service?.vendor?.name} ({b.service?.vendor?.company})
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.service?.vendor?.email}

                  </p>
                  <p className="text-xs text-gray-500">
                    📞 {b.service?.vendor?.phone}
                  </p>
                </div>

                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(b.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium text-gray-800">
                      {formatTime(b.time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-semibold text-green-700">
                      ₹{formatPrice(b.service?.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment</p>
                    <p
                      className={`font-medium ${b.payment?.paymentStatus === "success"
                        ? "text-green-700"
                        : b.payment?.paymentStatus === "pending"
                          ? "text-yellow-700"
                          : "text-red-700"
                        }`}
                    >
                      {b.payment?.paymentStatus || "N/A"}{" "}
                      {b.payment?.paymentType
                        ? `(${b.payment.paymentType})`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="border-t pt-3 mt-2">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">
                    Booked By
                  </h3>
                  <p className="text-sm text-gray-700">{b.user?.name}</p>
                  <p className="text-xs text-gray-500">{b.user?.email}</p>
                </div>

                {/* Notes (if available) */}
                {b.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 italic">📝 {b.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Generate Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (totalPages > 5) {
                  // Only show page 1, page totalPages, and page near currentPage
                  const showEllipsisBefore = page === 2 && currentPage > 3;
                  const showEllipsisAfter = page === totalPages - 1 && currentPage < totalPages - 2;

                  if (showEllipsisBefore) {
                    return (
                      <PaginationItem key="ellipsis-before">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  if (showEllipsisAfter) {
                    return (
                      <PaginationItem key="ellipsis-after">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  if (!isVisible) return null;
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AllBookingsPage;
