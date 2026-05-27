import { useEffect, useState } from "react";
import { getAllUsersAPI, changeUserType } from "@/service/operations/auth";
import { getUserInquiryApi } from "@/service/operations/contact";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Loader2,
  Users,
  Mail,
  Info,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(null);
  
  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit] = useState(10);
  
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const token = (user as any)?.token;
      const data = await getAllUsersAPI(page, limit, search, token);
      setUsers(data.users || []);
      setCurrentPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.totalUsers || 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on mount and when page/search changes
  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search button click
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("All Users", 14, 18);

    const tableColumn = ["#", "Name", "Email", "Type", "Created At"];

    const tableRows = [];

    users.forEach((u, index) => {
      const row = [
        (currentPage - 1) * limit + index + 1,
        u.name || "—",
        u.email,
        u.type === "active" ? "Active" : "Inactive",
        new Date(u.createdAt).toLocaleDateString(),
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] }, // Indigo color
    });

    doc.save("all-users.pdf");
  };

  // Change user type (Active/Inactive)
  const handleChangeType = async (id, newType) => {
    try {
      setTypeLoading(id);
      await changeUserType(id, newType);
      fetchUsers(currentPage, searchQuery);
    } catch {
      toast.error("Failed to update user type!");
    } finally {
      setTypeLoading(null);
    }
  };

  // Fetch inquiries
  const handleSeeInquiry = async (userId) => {
    setInquiryLoading(true);
    try {
      const data = await getUserInquiryApi(userId);
      setSelectedUser(users.find((u) => u._id === userId));
      setInquiries(data);
      setShowModal(true);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setInquiryLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setInquiries([]);
    setSelectedUser(null);
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (!user?.isUser) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-sm md:text-3xl font-extrabold mb-8 text-gray-900 flex items-center justify-center">
        <Users className="w-7 h-7 mr-3 text-indigo-600" />
        All Registered Users
      </h2>

      {/* Search and Actions Bar */}
   <div className="bg-white shadow-md rounded-xl p-4 mb-6">
  <div className="flex flex-col gap-4">
    
    {/* Search Section */}
    <div className="flex flex-col md:flex-row gap-3 w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Button
          onClick={handleSearch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto px-6"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>

        {searchQuery && (
          <Button
            onClick={handleClearSearch}
            variant="outline"
            className="w-full sm:w-auto px-4"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}

        <Button
          onClick={downloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-5"
        >
          Download PDF
        </Button>
      </div>
    </div>

    {/* Results Info */}
    {searchQuery && (
      <div className="text-sm text-gray-600">
        Found{" "}
        <span className="font-semibold text-indigo-600">
          {totalUsers}
        </span>{" "}
        user(s) matching "{searchQuery}"
      </div>
    )}
  </div>
</div>

      <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
            <p className="ml-3 text-lg text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No users found matching "${searchQuery}"` : "No users found."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Change Type
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Inquiries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Created At
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {user.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      {/* Type change dropdown */}
                      <td className="px-6 py-4 text-center">
                        <select
                          onChange={(e) =>
                            handleChangeType(user._id, e.target.value)
                          }
                          value={user.type}
                          disabled={typeLoading === user._id}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        {typeLoading === user._id && (
                          <Loader2 className="w-4 h-4 ml-2 inline-block animate-spin text-indigo-600" />
                        )}
                      </td>

                      {/* Inquiry Button */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleSeeInquiry(user._id)}
                          disabled={inquiryLoading}
                          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white shadow-sm transition duration-200 ease-in-out ${
                            inquiryLoading && selectedUser?._id === user._id
                              ? "bg-indigo-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          }`}
                        >
                          {inquiryLoading && selectedUser?._id === user._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Info className="w-4 h-4 mr-1" />
                          )}
                          Inquiry
                        </button>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{(currentPage - 1) * limit + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * limit, totalUsers)}
                  </span>{" "}
                  of <span className="font-semibold">{totalUsers}</span> users
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                          onClick={() => goToPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={`px-3 ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Inquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 md:p-8 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-indigo-600" />
              {selectedUser?.name}'s Inquiries
            </h3>

            {inquiryLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
                <p className="ml-3 text-gray-600">Loading inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <p className="text-center text-gray-500 italic py-10 border border-dashed rounded-lg">
                No inquiries found for this user.
              </p>
            ) : (
              <div className="space-y-6">
                {inquiries.map((inq, i) => (
                  <div
                    key={i}
                    className="border border-indigo-200 rounded-xl p-5 bg-indigo-50 shadow-md hover:shadow-lg"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm text-gray-700">
                      <p>
                        <strong>Name:</strong> {inq.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {inq.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {inq.phone || "—"}
                      </p>
                      <p>
                        <strong>Vendor:</strong> {inq.vendor || "—"}
                      </p>
                    </div>
                    <div className="mb-4">
                      <strong>Message:</strong>
                      <p className="bg-white p-3 rounded-lg border text-sm italic">
                        {inq.message}
                      </p>
                    </div>
                    <p className="text-gray-500 text-xs text-right">
                      Created: {new Date(inq.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
