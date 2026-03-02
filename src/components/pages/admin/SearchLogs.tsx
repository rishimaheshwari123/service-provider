import { useState, useEffect } from "react";
import { FaDownload, FaFilter, FaSearch, FaHome, FaList } from "react-icons/fa";
import axios from "axios";
import { searchLogs } from "../../../service/apis";

export default function SearchLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: "",
    category: "",
    page: "",
    startDate: "",
    endDate: "",
    pageNum: 1,
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

      const response = await axios.get(`${searchLogs.GET_ALL_LOGS_API}?${params}`);
      
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

      const response = await axios.get(`${searchLogs.GET_STATS_API}?${params}`);
      
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
        if (value && key !== "pageNum" && key !== "limit") {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${searchLogs.DOWNLOAD_LOGS_API}?${params}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `search-logs-${Date.now()}.xlsx`);
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

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, pageNum: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, pageNum: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaSearch className="text-blue-600" />
            Search Logs
          </h1>
          <p className="text-gray-600 mt-1">Track and analyze user search behavior</p>
        </div>

        {/* Stats Cards */}
        {stats && stats.overall && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Searches</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.overall.totalSearches}</p>
                </div>
                <FaSearch className="text-3xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Unique Searches</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.overall.uniqueSearches}</p>
                </div>
                <FaList className="text-3xl text-green-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Avg Results</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.overall.avgResults?.toFixed(1) || 0}
                  </p>
                </div>
                <FaList className="text-3xl text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Home Page</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.pageStats?.find((p: any) => p._id === "Home")?.count || 0}
                  </p>
                </div>
                <FaHome className="text-3xl text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input
              type="text"
              name="searchQuery"
              placeholder="Search query..."
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <input
              type="text"
              name="category"
              placeholder="Category..."
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <select
              name="page"
              value={filters.page}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Pages</option>
              <option value="Home">Home</option>
              <option value="Services">Services</option>
            </select>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload />
              Download Excel
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Search Query
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {log.searchQuery}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.page === "Home"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {log.page}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.resultsCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.userId || log.vendorId ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {log.userId?.name || log.vendorId?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {log.userId?.phone || log.vendorId?.phone || "No phone"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {log.userId ? "User" : "Vendor"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not logged in</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No search logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
