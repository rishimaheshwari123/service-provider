import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAuditLogsAPI, addAdminCommentAPI } from "@/service/operations/audit";
import { 
  Loader2, 
  ClipboardList, 
  Users, 
  Building2, 
  Clock, 
  Phone, 
  Mail,
  MessageSquare,
  Send, 
  FileDown, 
  Search, 
  Building,
  RotateCcw
} from "lucide-react";
import * as XLSX from "xlsx";

interface AuditLog {
  _id: string;
  userId?: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  propertyId?: {
    _id?: string;
    title?: string;
    vendor?: {
      _id?: string;
      name?: string;
      company?: string;
      phone?: string;
    } | null;
  } | null;
  type?: string;
  createdAt: string;
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 50;
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [addingComment, setAddingComment] = useState<string | null>(null);
  
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const fetchLogs = async (nextPage = 1, activeSearch = searchTerm) => {
    setLoading(true);
    try {
      const token = (user as any)?.token;
      const data = await getAuditLogsAPI(nextPage, activeSearch ? limit : limit, activeSearch, token);
      console.log("Audit Logs Response:", data);
      
      if (nextPage === 1) setLogs(data.logs || []);
      else setLogs((prev) => [...prev, ...(data.logs || [])]);

      setPage(nextPage);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading whenever the submitted search query changes
  useEffect(() => {
    fetchLogs(1, searchTerm);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const handleAddComment = async (logId: string) => {
    const comment = commentText[logId];
    
    if (!comment || !comment.trim()) {
      return;
    }

    try {
      setAddingComment(logId);
      const token = (user as any)?.token;
      const response = await addAdminCommentAPI(logId, comment.trim(), user._id, token);
      
      if (response?.success) {
        // Update local state with new comment
        setLogs(logs.map(log => 
          log._id === logId ? response.data : log
        ));
        // Clear comment text
        setCommentText(prev => ({
          ...prev,
          [logId]: ""
        }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setAddingComment(null);
    }
  };

  const handleCommentChange = (logId: string, value: string) => {
    setCommentText(prev => ({
      ...prev,
      [logId]: value
    }));
  };

  const downloadExcel = () => {
    const data = logs.map((log) => ({
      "User Name": log.userId?.name || "Not Added",
      "User Email": log.userId?.email || "Not Added",
      "User Phone": log.userId?.phone || "Not Added",
      "Property": log.propertyId?.title || "Deleted/Not Found",
      "Vendor Name": log.propertyId?.vendor?.name || "Not Added",
      "Vendor Company": log.propertyId?.vendor?.company || "Not Added",
      "Vendor Phone": log.propertyId?.vendor?.phone || "Not Added",
      "Type": log.type || "Normal business click",
      "Created At": new Date(log.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
    
    // Auto-size columns
    const maxWidth = 30;
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "audit-logs.xlsx");
  };

  // Derive simple real-time stats from the loaded logs list
  const totalInteractions = logs.length;
  const uniqueActiveUsers = new Set(logs.map(log => log.userId?.email).filter(Boolean)).size;
  const uniquePropertiesClicked = new Set(logs.map(log => log.propertyId?._id).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Modern Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
              <ClipboardList className="w-8 h-8 mr-2.5 text-indigo-600" />
              Audit Logs
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Track and monitor real-time platform user click-through interactions and contact conversions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadExcel}
              disabled={logs.length === 0}
              className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download Excel
            </button>
          </div>
        </div>

        {/* Dynamic Metric Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalInteractions}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Loaded Interactions</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{uniqueActiveUsers}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Active Users</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{uniquePropertiesClicked}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Services Clicks</div>
            </div>
          </div>

        </div>

        {/* Action / Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search audit logs by user, property or type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 h-11 border border-gray-300 rounded-lg bg-gray-50/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
              >
                Search
              </button>
              {(searchTerm || searchInput) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Audit Log Cards Container */}
        <div className="relative min-y-[200px]">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-600" />
                <p className="text-gray-600 font-medium">Fetching interaction logs...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No logs found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? "No records match your active search filter." : "There are currently no interaction log entries."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300 p-5 group shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    
                    {/* Primary Activity Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          log.type?.toLowerCase().includes('call') 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : log.type?.toLowerCase().includes('email')
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {log.type || "Platform Interaction"}
                        </span>
                        
                        <span className="text-gray-300">•</span>
                        
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Info Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        
                        {/* User Profile */}
                        <div className="space-y-1.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Information</div>
                          <div className="text-sm font-bold text-gray-900 flex items-center">
                            <Users className="w-4 h-4 mr-1.5 text-indigo-500 flex-shrink-0" />
                            {log.userId?.name || "Anonymous User"}
                          </div>
                          {log.userId?.email && (
                            <div className="text-xs text-gray-600 flex items-center break-all pl-5">
                              <Mail className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" />
                              {log.userId.email}
                            </div>
                          )}
                          {log.userId?.phone && (
                            <div className="text-xs text-gray-600 flex items-center pl-5">
                              <Phone className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" />
                              {log.userId.phone}
                            </div>
                          )}
                        </div>

                        {/* Property Target */}
                        <div className="space-y-1.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Service</div>
                          <div className="text-sm font-bold text-gray-900 flex items-center">
                            <Building2 className="w-4 h-4 mr-1.5 text-amber-500 flex-shrink-0" />
                            <span className="line-clamp-1">{log.propertyId?.title || "Deleted/Not Found"}</span>
                          </div>
                          <div className="text-xs text-gray-400 pl-5">
                            Reference ID: {log.propertyId?._id ? log.propertyId._id.substring(0, 8) + '...' : 'N/A'}
                          </div>
                        </div>

                        {/* Vendor Connected */}
                        <div className="space-y-1.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Provider details</div>
                          {log.propertyId?.vendor ? (
                            <>
                              <div className="text-sm font-bold text-gray-900 flex items-center">
                                <Building className="w-4 h-4 mr-1.5 text-emerald-500 flex-shrink-0" />
                                {log.propertyId.vendor.name || "Unnamed Vendor"}
                              </div>
                              {log.propertyId.vendor.company && (
                                <div className="text-xs text-gray-600 font-medium pl-5 truncate">
                                  💼 {log.propertyId.vendor.company}
                                </div>
                              )}
                              {log.propertyId.vendor.phone && (
                                <div className="text-xs text-gray-600 pl-5">
                                  📞 {log.propertyId.vendor.phone}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs font-semibold text-gray-400 italic flex items-center pt-1">
                              <Building className="w-4 h-4 mr-1.5 text-gray-300 flex-shrink-0" />
                              No provider assigned
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Admin Comments Section - Full Width at Bottom */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-base font-bold text-gray-800">Admin Comments</h4>
                      <span className="text-xs text-gray-500 ml-auto">
                        {log.adminComments?.length || 0} comment(s)
                      </span>
                    </div>

                    {/* Existing Comments - Full Width */}
                    {log.adminComments && log.adminComments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {log.adminComments.map((comment, index) => (
                          <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                  {comment.adminName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-indigo-900">
                                    {comment.adminName}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(comment.createdAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed pl-10">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Comment - Full Width */}
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
  <div className="flex flex-col sm:flex-row gap-3">
    <input
      type="text"
      value={commentText[log._id] || ""}
      onChange={(e) => handleCommentChange(log._id, e.target.value)}
      placeholder="Add your admin comment here..."
      disabled={addingComment === log._id}
      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium bg-white transition-all"
    />

    <button
      onClick={() => handleAddComment(log._id)}
      disabled={addingComment === log._id || !commentText[log._id]?.trim()}
      className={`px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
        addingComment === log._id || !commentText[log._id]?.trim()
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5"
      }`}
    >
      {addingComment === log._id ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          Add Comment
        </>
      )}
    </button>
  </div>
</div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {page < totalPages && logs.length > 0 && (
          <div className="mt-8 text-center">
            <button
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-all duration-150 text-sm"
              onClick={() => fetchLogs(page + 1)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load More Logs"
              )}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AdminAuditLogs;
