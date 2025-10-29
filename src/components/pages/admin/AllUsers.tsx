import { useEffect, useState } from "react";
import { getAllUsersAPI, changeUserType } from "@/service/operations/auth";
import { getUserInquiryApi } from "@/service/operations/contact";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Mail,
  User,
  Info,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersAPI();
      setUsers(data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Change user type (Active/Inactive)
  const handleChangeType = async (id, newType) => {
    try {
      setTypeLoading(id);
      const res = await changeUserType(id, newType);
      fetchUsers();
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

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center justify-center">
        <Users className="w-7 h-7 mr-3 text-indigo-600" />
        All Registered Users
      </h2>

      <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
            <p className="ml-3 text-lg text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-10">
            No users found.
          </p>
        ) : (
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
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Type
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
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {user.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    {/* Type display with icon */}
                    <td className="px-6 py-4 text-sm">
                      {user.type === "active" ? (
                        <span className="inline-flex items-center text-green-600 font-medium">
                          <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600 font-medium">
                          <XCircle className="w-5 h-5 mr-1 text-red-500" />
                          Inactive
                        </span>
                      )}
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
              {selectedUser?.name}’s Inquiries
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
