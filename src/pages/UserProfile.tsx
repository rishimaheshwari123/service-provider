import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getUserProfile } from "@/service/operations/auth";
import {
  FaUserCircle,
  FaEnvelope,
  FaTag,
  FaPhone,
  FaMapMarkerAlt,
  FaFileAlt,
} from "react-icons/fa"; // Icons के लिए
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// API response के स्ट्रक्चर के लिए Types (Optional, but recommended for TypeScript)
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

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserProfileData {
  success: boolean;
  message: string;
  user: UserData;
  inquiries: Inquiry[];
}

const UserProfile = () => {
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      // NOTE: Assuming getUserProfile returns the full JSON object you provided
      const response: UserProfileData = await getUserProfile(userId);
      setProfileData(response);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Handle error display here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?._id) {
      fetchProfile(authUser._id);
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Navbar />
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8 border-b-2 border-indigo-200 pb-2">
          My Profile
        </h1>

        {/* User Basic Details Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
            <FaUserCircle className="text-indigo-500 mr-3 text-3xl" />
            Account Information
          </h2>
          <div className="space-y-3">
            <p className="flex items-center text-lg text-gray-700">
              <span className="font-medium w-32 text-gray-500">Name:</span>
              <span className="ml-2 font-bold">{profileData.user.name}</span>
            </p>
            <p className="flex items-center text-lg text-gray-700">
              <span className="font-medium w-32 text-gray-500">Email:</span>
              <span className="ml-2">{profileData.user.email}</span>
            </p>
            <p className="flex items-center text-lg text-gray-700">
              <span className="font-medium w-32 text-gray-500">Role:</span>
              <span className="ml-2 capitalize">{profileData.user.role}</span>
            </p>
          </div>
        </div>

        {/* Inquiries Section */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
          My Recent Inquiries ({profileData.inquiries.length})
        </h2>

        {profileData.inquiries.length === 0 ? (
          <p className="text-xl text-gray-500 p-4 bg-white rounded-lg shadow">
            You have not made any inquiries yet.
          </p>
        ) : (
          <div className="space-y-6">
            {profileData.inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-indigo-100"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-3">
                  <h3 className="text-xl font-bold text-indigo-600 flex items-center">
                    <FaTag className="mr-2" />
                    Property: {inquiry.property.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold">Date:</span>{" "}
                    {formatDate(inquiry.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  {/* Inquiry Details */}
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900 mb-1">
                      Inquiry Details:
                    </p>
                    <p className="flex items-center">
                      <FaMapMarkerAlt className="text-sm mr-2 text-indigo-400" />
                      <span className="font-medium">Location:</span>{" "}
                      {inquiry.property.location}
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Price:</span> ₹
                      {inquiry.property.price}
                    </p>
                  </div>

                  {/* Vendor Details */}
                  <div className="space-y-2 border-l pl-4">
                    <p className="font-semibold text-gray-900 mb-1">
                      Vendor Contact:
                    </p>
                    <p className="flex items-center">
                      <FaUserCircle className="text-sm mr-2 text-indigo-400" />
                      <span className="font-medium">Vendor:</span>{" "}
                      {inquiry.vendor.company} ({inquiry.property.vendor.name})
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="text-sm mr-2 text-indigo-400" />
                      <span className="font-medium">Phone:</span>{" "}
                      {inquiry.phone}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold text-gray-900 flex items-center mb-1">
                    <FaFileAlt className="mr-2 text-indigo-500" /> Your Message:
                  </p>
                  <p className="p-3 bg-gray-100 rounded-lg text-gray-800 italic">
                    {inquiry.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
