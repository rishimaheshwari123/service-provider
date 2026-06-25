import { useState, useEffect } from "react";
import { FaFileSignature, FaUserCog, FaHistory } from "react-icons/fa";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { apiConnector } from "../../../service/apiConnector";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { systemAuditLog } from "../../../service/apis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Modal = ({ isOpen, onClose, children, title }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in overflow-auto">
      <div className="bg-white p-8 rounded-3xl shadow-3xl w-full max-w-lg relative transform scale-95 opacity-0 animate-scale-in-fade-in border border-gray-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200 focus:outline-none"
          title="Close"
        >
          <X className="h-7 w-7" />
        </button>
        {title && (
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default function SystemAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showCustomPageSize, setShowCustomPageSize] = useState(false);
  const [customPageSizeInput, setCustomPageSizeInput] = useState("");

  // Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Fetch logs
  const fetchLogs = async (page = 1, pageLimit = limit) => {
    setLoading(true);
    try {
      const token = (user as any)?.token;
      const response = await apiConnector(
        "GET",
        `${systemAuditLog.GET_SYSTEM_AUDIT_LOGS_API}?page=${page}&limit=${pageLimit}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (response.data && response.data.success) {
        setLogs(response.data.data || []);
        if (response.data.pagination) {
          setCurrentPage(Number(response.data.pagination.page));
          setTotalPages(Number(response.data.pagination.totalPages));
          setTotalLogs(Number(response.data.pagination.total));
        }
      } else {
        setLogs([]);
      }
    } catch (error: any) {
      console.error("Error fetching system audit logs:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch system logs",
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, limit);
  }, [currentPage]);

  // Format changes nicely
  const renderChanges = (changes: any) => {
    if (!changes) return null;
    const oldData = changes.oldData || {};
    const newData = changes.newData || {};

    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    const ignoredFields = ["_id", "__v", "createdAt", "updatedAt", "password"];

    const diffs: any = {};
    allKeys.forEach((key) => {
      if (ignoredFields.includes(key)) return;

      const oldVal = oldData[key];
      const newVal = newData[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs[key] = { old: oldVal, new: newVal };
      }
    });

    if (Object.keys(diffs).length === 0) return null;

    return (
      <div className="flex flex-col gap-1 mt-2 text-sm">
        {Object.entries(diffs).map(([field, change]: any) => (
          <div
            key={field}
            className="flex flex-wrap gap-1 items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
          >
            <span className="font-semibold text-gray-700 capitalize">
              {field}:
            </span>
            {change.old !== undefined && change.old !== null && (
              <span className="text-red-500 line-through">
                {typeof change.old === "object"
                  ? JSON.stringify(change.old)
                  : String(change.old)}
              </span>
            )}
            {change.old !== undefined &&
              change.old !== null &&
              change.new !== undefined &&
              change.new !== null && <span className="text-gray-400">→</span>}
            {change.new !== undefined && change.new !== null && (
              <span className="text-green-600 font-medium">
                {typeof change.new === "object"
                  ? JSON.stringify(change.new)
                  : String(change.new)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!user?.isLogs) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex flex-col md:ml-6 font-inter p-3">
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLog(null);
        }}
        title="Audit Log Details"
      >
        {selectedLog && (
          <div className="space-y-4">
            {selectedLog.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {selectedLog.description}
                </p>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Changes Made
              </h3>
              {renderChanges(selectedLog.changes) || (
                <p className="text-sm text-gray-500 italic">
                  No specific field changes recorded.
                </p>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => setShowDetailsModal(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserCog className="text-purple-600" />
            System Audit Logs
          </h1>
          <p className="text-gray-600 mt-2">
            Track modifications, creations, and deletions within the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Audit Logs</p>
                <p className="text-2xl font-bold text-gray-800">{totalLogs}</p>
              </div>
              <FaHistory className="text-3xl text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Current Page</p>
                <p className="text-2xl font-bold text-gray-800">
                  {currentPage}{" "}
                  <span className="text-sm text-gray-500 font-normal">
                    of {totalPages}
                  </span>
                </p>
              </div>
              <FaFileSignature className="text-3xl text-green-500" />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed On
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.action === "CREATE"
                              ? "bg-green-100 text-green-800"
                              : log.action === "DELETE"
                                ? "bg-red-100 text-red-800"
                                : log.action === "UPDATE"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-800">
                          {log.actorId?.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {log.actorId?._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-800">
                          {log.entityId?.name } <span>({ log.entityModel})</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {log.entityId?._id || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center gap-2 mx-auto text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No system audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
            <div className="text-sm text-gray-600 order-2 sm:order-1">
              Page {currentPage} of {totalPages} &bull; {totalLogs} total logs
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        className={`w-8 h-8 p-0 text-xs ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Rows per page dropdown */}
            <div className="flex items-center gap-2 order-3">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Rows per page:
              </span>
              <Select
                value={
                  showCustomPageSize
                    ? "custom"
                    : limit >= 99999
                      ? "all"
                      : String(limit)
                }
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustomPageSize(true);
                  } else if (value === "all") {
                    setShowCustomPageSize(false);
                    setCustomPageSizeInput("");
                    setLimit(99999);
                    setCurrentPage(1);
                    fetchLogs(1, 99999);
                  } else {
                    setShowCustomPageSize(false);
                    setCustomPageSizeInput("");
                    const size = parseInt(value);
                    if (limit !== size) {
                      setLimit(size);
                      setCurrentPage(1);
                      fetchLogs(1, size);
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
                      if (e.key === "Enter") {
                        const val = parseInt(customPageSizeInput);
                        if (val && val > 0 && val <= 500) {
                          setLimit(val);
                          setCurrentPage(1);
                          setShowCustomPageSize(false);
                          fetchLogs(1, val);
                        }
                      }
                    }}
                    className="h-8 w-20 text-sm bg-white"
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
                        fetchLogs(1, val);
                      }
                    }}
                  >
                    Go
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleInFadeIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-scale-in-fade-in { animation: scaleInFadeIn 0.5s ease-out forwards; }
        .shadow-3xl { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15), 0 10px 20px -5px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
