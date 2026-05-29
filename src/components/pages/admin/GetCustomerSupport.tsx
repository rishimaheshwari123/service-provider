import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Loader2, MessageSquare, Send } from "lucide-react";
import { getCustomerSupportRequestAPI, updateSupportStatusAPI, addAdminRemarkAPI } from "@/service/operations/customerSupport";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const GetCustomerSupport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [remarkText, setRemarkText] = useState<Record<string, string>>({});
  const [addingRemark, setAddingRemark] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const token = (user as any)?.token;
      const response = await getCustomerSupportRequestAPI(token);
      if (response?.success) {
        setRequests(response?.data);
        // Initialize selected statuses with current status
        const initialStatuses = {};
        response?.data.forEach(req => {
          initialStatuses[req._id] = req.status || "in_progress";
        });
        setSelectedStatuses(initialStatuses);
      } else {
        setError("Failed to fetch support requests.");
      }
    } catch (err) {
      console.error("Error fetching support requests:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const handleStatusChange = async (requestId: string) => {
    const newStatus = selectedStatuses[requestId];
    
    try {
      setUpdatingStatus(requestId);
      const token = (user as any)?.token;
      const response = await updateSupportStatusAPI(requestId, newStatus, token);
      
      if (response?.success) {
        // Update local state
        setRequests(requests.map(req => 
          req._id === requestId ? { ...req, status: newStatus } : req
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDropdownChange = (requestId: string, newStatus: string) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [requestId]: newStatus
    }));
  };

  const handleAddRemark = async (requestId: string) => {
    const remark = remarkText[requestId];
    
    if (!remark || !remark.trim()) {
      return;
    }

    try {
      setAddingRemark(requestId);
      const token = (user as any)?.token;
      const response = await addAdminRemarkAPI(requestId, remark.trim(), user._id, token);
      
      if (response?.success) {
        // Update local state with new remark
        setRequests(requests.map(req => 
          req._id === requestId ? response.data : req
        ));
        // Clear remark text
        setRemarkText(prev => ({
          ...prev,
          [requestId]: ""
        }));
      }
    } catch (error) {
      console.error("Error adding remark:", error);
    } finally {
      setAddingRemark(null);
    }
  };

  const handleRemarkChange = (requestId: string, value: string) => {
    setRemarkText(prev => ({
      ...prev,
      [requestId]: value
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Resolved"
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: <XCircle className="w-4 h-4" />,
          label: "Rejected"
        };
      case "in_progress":
      default:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
          label: "In Progress"
        };
    }
  };

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
    <div className="min-h-screen md:ml-6 font-inter antialiased text-gray-800">
      {/* Main Content Section */}
      <main className=" mb-4">
        <h2 className="text-xl md:text-4xl font-extrabold text-blue-700 mb-4 md:mb-8 rounded-md text-center">
          Current Support Requests
        </h2>
        {requests.length === 0 ? (
          <div className="text-center text-gray-600 text-xl p-8 border border-dashed border-gray-300 rounded-lg">
            No support requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const isUpdating = updatingStatus === request._id;
              const hasStatusChanged = selectedStatuses[request._id] !== request.status;
              
              return (
                <div
                  key={request._id}
                  className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow"
                >
                  {/* Header with Status and Date */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-blue-800 mb-1">
                      Subject : {request.subject}
                    </h3>
                  </div>

                  {/* User Info */}
                  <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
  <span className="text-sm font-semibold text-gray-600">
    From:
  </span>

  <p className="text-sm font-medium text-gray-800">
    {request.name}
  </p>

  <a
    href={`mailto:${request.email}`}
    className="text-sm text-blue-600 hover:underline"
  >
    {request.email}
  </a>
</div>

                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-600 w-20">Category:</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {request.category
                          .replace(/_/g, " ")
                          .split(" ")
                          .map(
                            (word) => word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {request.message}
                    </p>
                  </div>

                  {/* Status Update Actions */}
               <div className="pt-4 border-t border-gray-200">
  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
    
    {/* Select */}
    <select
      value={selectedStatuses[request._id] || request.status}
      onChange={(e) =>
        handleDropdownChange(request._id, e.target.value)
      }
      disabled={isUpdating}
      className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white"
    >
      <option value="in_progress">🟡 In Progress</option>
      <option value="resolved">✅ Resolved</option>
      <option value="rejected">❌ Rejected</option>
    </select>

    {/* Button */}
    <button
      onClick={() => handleStatusChange(request._id)}
      disabled={isUpdating || !hasStatusChanged}
      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
        isUpdating
          ? "bg-gray-400 text-white cursor-not-allowed"
          : hasStatusChanged
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {isUpdating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          Update Status
        </>
      )}
    </button>
  </div>

  {hasStatusChanged && !isUpdating && (
    <p className="text-xs text-blue-600 mt-2 text-center sm:text-left">
      Click "Update Status" to save changes
    </p>
  )}
</div>

                  {/* Admin Remarks Section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-800">Admin Remarks</h4>
                    </div>

                    {/* Existing Remarks */}
                    {request.adminRemarks && request.adminRemarks.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {request.adminRemarks.map((remark, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm font-semibold text-blue-800">
                                {remark.adminName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(remark.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{remark.remark}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Remark */}
                  <div className="flex flex-col sm:flex-row gap-2">
  <input
    type="text"
    value={remarkText[request._id] || ""}
    onChange={(e) => handleRemarkChange(request._id, e.target.value)}
    placeholder="Add admin remark..."
    disabled={addingRemark === request._id}
    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
  />

  <button
    onClick={() => handleAddRemark(request._id)}
    disabled={addingRemark === request._id || !remarkText[request._id]?.trim()}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
      addingRemark === request._id || !remarkText[request._id]?.trim()
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
  >
    {addingRemark === request._id ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Adding...
      </>
    ) : (
      <>
        <Send className="w-4 h-4" />
        Add
      </>
    )}
  </button>
</div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default GetCustomerSupport;
