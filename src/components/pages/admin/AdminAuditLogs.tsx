import { useState, useEffect } from "react";
import { getAuditLogsAPI } from "@/service/operations/audit";
import { Loader2 } from "lucide-react";
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
  const limit = 50;

  const fetchLogs = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await getAuditLogsAPI(nextPage, limit, "");
      console.log("Audit Logs Response:", data);
      console.log("First log sample:", data.logs?.[0]);
      if (nextPage === 1) setLogs(data.logs);
      else setLogs((prev) => [...prev, ...data.logs]);

      setPage(nextPage);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={downloadExcel}
          disabled={logs.length === 0}
        >
          Download Excel
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No audit logs found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              className="border p-3 rounded shadow-sm bg-gray-50"
            >
              <p>
                <strong>User:</strong> {log.userId?.name || "Not Added"} (
                {log.userId?.email || "Not Added"}) 📞 {log.userId?.phone || "Not Added"}
              </p>

              <p>
                <strong>Property:</strong> {log.propertyId?.title || "Deleted/Not Found"}
              </p>

              {log.propertyId?.vendor ? (
                <p>
                  <strong>Vendor:</strong> {log.propertyId.vendor.name || "Not Added"} (
                  {log.propertyId.vendor.company || "Not Added"}) 📞{" "}
                  {log.propertyId.vendor.phone || "Not Added"}
                </p>
              ) : (
                <p>
                  <strong>Vendor:</strong> Not Added
                </p>
              )}

              <p>
                <strong>Type:</strong> {log.type || "Normal business click"}
              </p>

              <p className="text-xs text-gray-500">
                Created at: {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {page < totalPages && logs.length > 0 && (
        <div className="mt-6 text-center">
          <button
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fetchLogs(page + 1)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
