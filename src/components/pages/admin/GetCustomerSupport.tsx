import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { getCustomerSupportRequestAPI } from "@/service/operations/customerSupport";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
const GetCustomerSupport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  useEffect(() => {
    const fetchSupportRequests = async () => {
      try {
        setLoading(true); // Start loading
        const response = await getCustomerSupportRequestAPI();
        if (response?.success) {
          setRequests(response?.data);
        } else {
          setError("Failed to fetch support requests.");
        }
      } catch (err) {
        console.error("Error fetching support requests:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchSupportRequests();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-600">
          Loading support requests...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-lg p-8">
        <p>{error}</p>
        {/* No back button needed if only requests are displayed */}
      </div>
    );
  }

  if (!user?.isSupport) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 font-inter antialiased text-gray-800">
      {/* Header Section */}

      {/* Main Content Section - Displaying Requests */}
      <main className="container mx-auto my-8 p-4 md:p-12 bg-white shadow-2xl rounded-3xl">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-10 rounded-md text-center">
          Current Support Requests
        </h2>
        {requests.length === 0 ? (
          <div className="text-center text-gray-600 text-xl p-8 border border-dashed border-gray-300 rounded-lg">
            No support requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                    {request.subject}
                  </h3>
                  <p className="text-gray-700 mb-1">
                    <strong>ID:</strong> {request._id}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>From:</strong> {request.name} (
                    <a
                      href={`mailto:${request.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {request.email}
                    </a>
                    )
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Category:</strong>{" "}
                    <span className="font-medium text-purple-700">
                      {request.category
                        .replace(/_/g, " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </span>
                  </p>
                  <p className="text-gray-600 mt-3 border-t border-gray-200 pt-3">
                    <span className="font-semibold">Message:</span>{" "}
                    {request.message}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {request.status}
                  </span>
                  <span>
                    Date: {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GetCustomerSupport; // Export GetCustomerSupport as the main component
