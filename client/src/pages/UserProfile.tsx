import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { getUserProfile, updateUserProfileAPI, changePasswordAPI } from "@/service/operations/auth";
import { getUserAllBookingAPI } from "@/service/operations/booking";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";
import {
  FaUserCircle,
  FaEnvelope,
  FaTag,
  FaPhone,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaShoppingCart,
  FaQuestionCircle,
  FaEdit,
  FaLock,
  FaSave,
  FaTimes,
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
  FaGift,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import UserRewardPoints from "./UserRewardPoints";
interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  property: {
    title: string;
    price: string;
    location: string;
    vendor: {
      name: string;
      company: string;
    };
  };
  vendor: {
    company: string;
    phone: string;
  };
}

interface Booking {
  _id: string;
  service: {
    _id: string;
    title: string;
    price: number;
    location: string;
    images?: string[];
  };
  date: string;
  time: string;
  notes?: string;
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
    transactionId?: string;
    paymentType: "online" | "cash" | "upi" | "card";
    paymentStatus: "pending" | "success" | "failed";
  };
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  role: string;
  createdAt: string;
}

interface UserProfileData {
  success: boolean;
  message: string;
  user: UserData;
  inquiries: Inquiry[];
}

interface BookingsResponse {
  success: boolean;
  total: number;
  bookings: Booking[];
}

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "bookings" | "inquiries" | "rewards"
  >("bookings");

  // Edit Profile States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Phone Verification States
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);

  // Sorting States
  const [bookingSortOrder, setBookingSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [inquirySortOrder, setInquirySortOrder] = useState<"asc" | "desc">(
    "desc",
  );

  // Pagination States
  const [bookingPage, setBookingPage] = useState(1);
  const [inquiryPage, setInquiryPage] = useState(1);
  const itemsPerPage = 20;

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      const response: UserProfileData = await getUserProfile(userId);
      setProfileData(response);
      setEditName(response.user.name);
      setEditEmail(response.user.email);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerificationSuccess = () => {
    // Refresh profile data after verification
    if (authUser?._id) {
      fetchProfile(authUser._id);
    }
    setShowPhoneVerificationModal(false);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await updateUserProfileAPI(authUser?._id, {
        name: editName,
        email: editEmail,
      });

      if (response && response.success) {
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                user: { ...prev.user, name: editName, email: editEmail },
              }
            : null,
        );
        dispatch(setUser({ ...authUser, name: editName, email: editEmail }));
        setIsEditMode(false);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {
      const response = await changePasswordAPI(authUser?._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response && response.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchBookings = async () => {
    try {
      if (!authUser?._id) return;
      
      const token = (authUser as any)?.token;
      const userBookings = await getUserAllBookingAPI(authUser._id, token);
      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    if (authUser?._id) {
      fetchProfile(authUser._id);
      fetchBookings();
    }
  }, [authUser?._id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl font-semibold text-gray-600">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load profile data.
      </div>
    );
  }

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime12Hour = (timeString: string) => {
    if (!timeString) return "";

    // Handle ISO date string format (e.g., "2026-02-03T11:39:00.000Z")
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Handle HH:MM format (e.g., "15:00")
    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeString;

    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="inline mr-1" />;
      case "confirmed":
        return <FaCheckCircle className="inline mr-1" />;
      case "pending":
        return <FaHourglassHalf className="inline mr-1" />;
      case "cancelled":
        return <FaTimesCircle className="inline mr-1" />;
      default:
        return null;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "cash":
        return "Cash on Service";
      case "online":
        return "Online Payment";
      case "upi":
        return "UPI Payment";
      case "card":
        return "Card Payment";
      default:
        return type;
    }
  };

  // Sorting Functions
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return bookingSortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const sortedInquiries = [...(profileData?.inquiries || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return inquirySortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Pagination Functions
  const paginatedBookings = sortedBookings.slice(
    (bookingPage - 1) * itemsPerPage,
    bookingPage * itemsPerPage,
  );

  const paginatedInquiries = sortedInquiries.slice(
    (inquiryPage - 1) * itemsPerPage,
    inquiryPage * itemsPerPage,
  );

  const totalBookingPages = Math.ceil(bookings.length / itemsPerPage);
  const totalInquiryPages = Math.ceil(
    (profileData?.inquiries.length || 0) / itemsPerPage,
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your account and view your activity
            </p>
          </div>

          {/* User Basic Details Card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-4 mr-4">
                  <FaUserCircle className="text-white text-4xl sm:text-5xl" />
                </div>
                <div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 focus:outline-none px-2 py-1"
                    />
                  ) : (
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {profileData.user.name}
                    </h2>
                  )}
                  <p className="text-gray-500 capitalize mt-1">
                    {profileData.user.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaSave /> Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditName(profileData.user.name);
                        setEditEmail(profileData.user.email);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FaLock /> Change Password
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <FaEnvelope className="text-indigo-500 mr-3 text-xl flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email Address</p>
                    {isEditMode ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="font-semibold border-b-2 border-indigo-500 focus:outline-none px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="font-semibold break-all">
                        {profileData.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaPhone className="text-indigo-500 mr-3 text-xl flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {profileData.user.phone || "Not provided"}
                      </p>
                      {profileData.user.phone && (
                        profileData.user.phoneVerified ? (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <FaCheckCircle /> Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => setShowPhoneVerificationModal(true)}
                            className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors font-medium"
                          >
                            Verify Now
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaCalendarAlt className="text-indigo-500 mr-3 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-semibold">
                      {formatDateOnly(profileData.user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Bookings
                    </span>
                    <FaShoppingCart className="text-indigo-500 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-indigo-600">
                    {bookings.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Inquiries
                    </span>
                    <FaQuestionCircle className="text-purple-500 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {profileData.inquiries.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "bookings"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaShoppingCart className="inline mr-2" />
                My Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "inquiries"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaQuestionCircle className="inline mr-2" />
                My Inquiries ({profileData.inquiries.length})
              </button>
              <button
                onClick={() => setActiveTab("rewards")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "rewards"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaGift className="inline mr-2" />
                My Rewards
              </button>
            </div>

            <div className="p-6">
              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-xl text-gray-500">
                        You haven't made any bookings yet.
                      </p>
                      <p className="text-gray-400 mt-2">
                        Start exploring our services and book your first
                        service!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Sort Controls */}
                      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <p className="text-gray-600 font-medium">
                          Showing {paginatedBookings.length} of{" "}
                          {bookings.length} bookings
                        </p>
                        <button
                          onClick={() =>
                            setBookingSortOrder(
                              bookingSortOrder === "desc" ? "asc" : "desc",
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                        >
                          <FaSortAmountDown />
                          Sort by Date (
                          {bookingSortOrder === "desc"
                            ? "Newest First"
                            : "Oldest First"}
                          )
                        </button>
                      </div>

                      <div className="space-y-6">
                        {paginatedBookings.map((booking) => (
                          <div
                            key={booking._id}
                            className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                          >
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                  {booking.service.title}
                                </h3>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <span
                                    className={`px-3 py-1 rounded-full font-semibold border ${getStatusColor(
                                      booking.status,
                                    )}`}
                                  >
                                    {getStatusIcon(booking.status)}
                                    {booking.status.toUpperCase()}
                                  </span>
                                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">
                                    <FaMoneyBillWave className="inline mr-1" />
                                    {getPaymentTypeLabel(
                                      booking.payment.paymentType,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center text-gray-700">
                                <FaCalendarAlt className="text-indigo-500 mr-2" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Booking Date
                                  </p>
                                  <p className="font-semibold">
                                    {formatDateOnly(booking.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <FaClock className="text-indigo-500 mr-2" />
                                <div>
                                  <p className="text-xs text-gray-500">Time</p>
                                  <p className="font-semibold">
                                    {formatTime12Hour(booking.time)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Service Address */}
                            {booking.address ? (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                  <FaMapMarkerAlt className="text-indigo-500 mr-2" />
                                  Service Address:
                                </p>
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                  <div className="text-sm text-gray-700 space-y-1">
                                    <p className="font-medium">
                                      {booking.address.addressLine1}
                                    </p>
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
                                      <p className="font-medium text-indigo-700">
                                        {booking.address.country}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                  <FaMapMarkerAlt className="text-gray-400 mr-2" />
                                  Service Address:
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-500 italic">
                                    Address not provided (older booking)
                                  </p>
                                </div>
                              </div>
                            )}

                            {booking.notes && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-1 font-semibold">
                                  Notes:
                                </p>
                                <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
                                  {booking.notes}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                              Booked on: {formatDate(booking.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalBookingPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                          <button
                            onClick={() =>
                              setBookingPage(Math.max(1, bookingPage - 1))
                            }
                            disabled={bookingPage === 1}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaChevronLeft />
                          </button>

                          <div className="flex gap-2 flex-wrap">
                            {Array.from(
                              { length: totalBookingPages },
                              (_, i) => i + 1,
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => setBookingPage(page)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  bookingPage === page
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() =>
                              setBookingPage(
                                Math.min(totalBookingPages, bookingPage + 1),
                              )
                            }
                            disabled={bookingPage === totalBookingPages}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Inquiries Tab */}
              {activeTab === "inquiries" && (
                <div>
                  {profileData.inquiries.length === 0 ? (
                    <div className="text-center py-12">
                      <FaQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-xl text-gray-500">
                        You haven't made any inquiries yet.
                      </p>
                      <p className="text-gray-400 mt-2">
                        Have questions? Send an inquiry to our vendors!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Sort Controls */}
                      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <p className="text-gray-600 font-medium">
                          Showing {paginatedInquiries.length} of{" "}
                          {profileData.inquiries.length} inquiries
                        </p>
                        <button
                          onClick={() =>
                            setInquirySortOrder(
                              inquirySortOrder === "desc" ? "asc" : "desc",
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <FaSortAmountDown />
                          Sort by Date (
                          {inquirySortOrder === "desc"
                            ? "Newest First"
                            : "Oldest First"}
                          )
                        </button>
                      </div>

                      <div className="space-y-6">
                        {paginatedInquiries.map((inquiry) => (
                          <div
                            key={inquiry._id}
                            className="bg-gradient-to-r from-white to-purple-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-purple-200"
                          >
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
                              <h3 className="text-xl font-bold text-purple-700 flex items-center">
                                <FaTag className="mr-2" />
                                {inquiry.property.title}
                              </h3>
                              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                                {formatDate(inquiry.createdAt)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div className="space-y-3">
                                <p className="font-semibold text-gray-900 mb-2">
                                  Service Details:
                                </p>
                                <div className="flex items-center text-gray-700">
                                  <FaMapMarkerAlt className="text-purple-500 mr-2" />
                                  <span>{inquiry.property.location}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <FaMoneyBillWave className="text-purple-500 mr-2" />
                                  <span className="font-semibold">
                                    ₹{inquiry.property.price}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3 md:border-l md:pl-6">
                                <p className="font-semibold text-gray-900 mb-2">
                                  Vendor Contact:
                                </p>
                                <div className="flex items-center text-gray-700">
                                  <FaUserCircle className="text-purple-500 mr-2" />
                                  <span>
                                    {inquiry.vendor.company} (
                                    {inquiry.property.vendor.name})
                                  </span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <FaPhone className="text-purple-500 mr-2" />
                                  <span>{inquiry.phone}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-purple-200">
                              <p className="font-semibold text-gray-900 flex items-center mb-2">
                                <FaFileAlt className="mr-2 text-purple-500" />
                                Your Message:
                              </p>
                              <p className="p-4 bg-white rounded-lg text-gray-700 border border-purple-100">
                                {inquiry.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalInquiryPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                          <button
                            onClick={() =>
                              setInquiryPage(Math.max(1, inquiryPage - 1))
                            }
                            disabled={inquiryPage === 1}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaChevronLeft />
                          </button>

                          <div className="flex gap-2 flex-wrap">
                            {Array.from(
                              { length: totalInquiryPages },
                              (_, i) => i + 1,
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => setInquiryPage(page)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  inquiryPage === page
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() =>
                              setInquiryPage(
                                Math.min(totalInquiryPages, inquiryPage + 1),
                              )
                            }
                            disabled={inquiryPage === totalInquiryPages}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === "rewards" && (
                <div>
                  <UserRewardPoints />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaLock className="text-purple-600" />
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showPhoneVerificationModal && profileData?.user.phone && (
        <PhoneVerificationModal
          isOpen={showPhoneVerificationModal}
          onClose={() => setShowPhoneVerificationModal(false)}
          userId={profileData.user._id}
          phoneNumber={profileData.user.phone}
          onVerificationSuccess={handlePhoneVerificationSuccess}
        />
      )}
    </>
  );
};

export default UserProfile;
