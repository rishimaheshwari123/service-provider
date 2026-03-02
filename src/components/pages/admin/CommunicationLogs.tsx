import { useState, useEffect } from "react";
import { FaDownload, FaFilter, FaSms, FaWhatsapp, FaEnvelope, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { communicationLogs } from "../../../service/apis";

export default function CommunicationLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    purpose: "",
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await axios.get(`${communicationLogs.GET_ALL_LOGS_API}?${params}`);
      
      if (response.data && response.data.logs) {
        setLogs(response.data.logs || []);
        setPagination(response.data.pagination || { total: 0, page: 1, pages: 1 });
      } else {
        setLogs([]);
        setPagination({ total: 0, page: 1, pages: 1 });
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      setPagination({ total: 0, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await axios.get(`${communicationLogs.GET_STATS_API}?${params}`);
      
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    }
  };

  // Download Excel
  const downloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "page" && key !== "limit") {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${communicationLogs.DOWNLOAD_LOGS_API}?${params}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `communication-logs-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading logs:", error);
      alert("Failed to download logs");
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SMS":
        return <FaSms className="text-blue-500" />;
      case "WhatsApp":
        return <FaWhatsapp className="text-green-500" />;
      case "Email":
        return <FaEnvelope className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Success: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Pending: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Communication Logs</h1>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FaDownload />
            Download Excel
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Messages</div>
              <div className="text-2xl font-bold text-gray-800">{stats.overall.totalMessages}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.overall.totalMessages > 0
                  ? ((stats.overall.successCount / stats.overall.totalMessages) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">{stats.overall.failedCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Cost</div>
              <div className="text-2xl font-bold text-blue-600">₹{stats.overall.totalCost.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="SMS">SMS</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
            </select>

            <select
              value={filters.purpose}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value, page: 1 })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Purposes</option>
              <option value="OTP">OTP</option>
              <option value="Welcome">Welcome</option>
              <option value="Approval">Approval</option>
              <option value="Rejection">Rejection</option>
              <option value="Password Reset">Password Reset</option>
              <option value="Notification">Notification</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="border rounded-lg px-3 py-2"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="border rounded-lg px-3 py-2"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : !logs || logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <span className="text-sm font-medium">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.purpose}</td>
                     
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.recipient?.phone || log.vendorId?.phone || "-"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₹{log.cost?.toFixed(2) || "0.00"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={log.message}>
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * filters.limit + 1} to{" "}
                {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
