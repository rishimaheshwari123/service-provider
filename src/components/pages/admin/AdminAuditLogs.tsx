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

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 50;

  // Vendor ID derived from logged-in user

  const fetchLogs = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await getAuditLogsAPI(nextPage, limit, "");
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
        >
          Download PDF
        </button>
      </div>

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

      {page < totalPages && (
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => fetchLogs(page + 1)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
          ) : (
            "Load More"
          )}
        </button>
      )}
    </div>
  );
};

export default AdminAuditLogs;
