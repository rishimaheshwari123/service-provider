import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllBookingAPI } from "@/service/operations/booking";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Booking {
  _id: string;
  user: {
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

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getAllBookingAPI();
        setBookings(data);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 text-gray-800">
        All Bookings
      </h1>

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
                  className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                    b.status === "completed"
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
                  <p className="text-sm text-gray-500 capitalize">
                    {b.service?.category} • {b.service?.type}
                  </p>
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
                      ₹{Number(b.service?.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment</p>
                    <p
                      className={`font-medium ${
                        b.payment?.paymentStatus === "success"
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
    </div>
  );
};

export default AllBookingsPage;
