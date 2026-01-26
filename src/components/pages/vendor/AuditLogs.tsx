import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAuditLogsAPI } from "@/service/operations/audit";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditLog {
  _id: string;
  userId?: {
    name: string;
    email: string;
    phone?: string;
  };
  propertyId?: {
    title?: string;
    vendor?: {
      name?: string;
      company?: string;
      phone?: string;
    };
  };
  type?: string;
  createdAt: string;
}

const AuditLogsPage = () => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 50;

  // Vendor ID derived from logged-in user
  const vendorId = user?._id || "";

  const fetchLogs = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await getAuditLogsAPI(nextPage, limit, vendorId);
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
  }, [vendorId]);

  const downloadPDF = () => {
    const doc = new jsPDF();

    const head = [
      [
        "User",
        "Email",
        "User Phone",
        "Property",
        "Vendor",
        "Vendor Phone",
        "Type",
        "Created At",
      ],
    ];

    const body = logs.map((log) => [
      log.userId?.name || "-",
      log.userId?.email || "-",
      log.userId?.phone || "-",
      log.propertyId?.title || "-",
      log.propertyId?.vendor?.name || "-",
      log.propertyId?.vendor?.phone || "-",
      log.type || "Normal business click",
      new Date(log.createdAt).toLocaleString(),
    ]);

    autoTable(doc, { head, body });
    doc.save("audit-logs.pdf");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={downloadPDF}
          disabled={logs.length === 0}
        >
          Download PDF
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
                <strong>User:</strong> {log.userId?.name || "-"} (
                {log.userId?.email || "-"}) 📞 {log.userId?.phone || "-"}
              </p>

              <p>
                <strong>Property:</strong> {log.propertyId?.title || "-"}
              </p>

              {log.propertyId?.vendor && (
                <p>
                  <strong>Vendor:</strong> {log.propertyId.vendor.name || "-"} (
                  {log.propertyId.vendor.company || "-"}) 📞{" "}
                  {log.propertyId.vendor.phone || "-"}
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

export default AuditLogsPage;
