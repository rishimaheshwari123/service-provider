import React, { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";
import {
  getAllUsersAPI,
  editPermissionAPI,
  deleteUserAPI,
} from "@/service/operations/auth";
import { FaTrash } from "react-icons/fa";

const Modal = ({ isOpen, onClose, children, title }) => {
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

export const GetAllEmployee = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const initialEditFormData = {
    name: "",
    email: "",
    type: "active", // Active / Inactive
    role: "user", // Admin / User / Staff / Subadmin / Other
    isVendor: false,
    isBlog: false,
    isUser: false,
    isSupport: false,
    isJob: false,
    isAds: false,
    isBooking: false,
    isEmpManage: false,
    isCategoryManage: false,
    isManageService: false,
  };

  const [editFormData, setEditFormData] = useState(initialEditFormData);

  const permissionFields = [
    { id: "isVendor", label: "Vendor" },
    { id: "isBlog", label: "Blog" },
    { id: "isUser", label: "User" },
    { id: "isSupport", label: "Support" },
    { id: "isJob", label: "Job" },
    { id: "isAds", label: "Ads" },
    { id: "isBooking", label: "Booking" },
    { id: "isEmpManage", label: "Employee Manage" },
    { id: "isCategoryManage", label: "Category Manage" },
    { id: "isManageService", label: "Service Manage" },
  ];

  const fetchEmployees = async () => {
    setMessage("Loading employees...");
    setIsSuccess(false);
    try {
      const response = await getAllUsersAPI();
      if (response) {
        setEmployees(response);
        setMessage("");
      } else {
        setMessage("Failed to load employees.");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setMessage("An error occurred while loading employees.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      name: employee.name || "",
      email: employee.email || "",
      type: employee.type || "active",
      role: employee.role || "user",
      isVendor: employee.isVendor || false,
      isBlog: employee.isBlog || false,
      isUser: employee.isUser || false,
      isSupport: employee.isSupport || false,
      isJob: employee.isJob || false,
      isAds: employee.isAds || false,
      isBooking: employee.isBooking || false,
      isEmpManage: employee.isEmpManage || false,
      isCategoryManage: employee.isCategoryManage || false,
      isManageService: employee.isManageService || false,
    });
    setShowEditModal(true);
    setMessage("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setMessage("Updating employee information and permissions...");
    setIsSuccess(false);

    try {
      const dataToUpdate = { ...editFormData };
      const id = editingEmployee._id;
      const response = await editPermissionAPI(id, dataToUpdate);
      if (response.success) {
        setMessage(response.message);
        setIsSuccess(true);
        setEditingEmployee(null);
        setShowEditModal(false);
        fetchEmployees();
      } else {
        setMessage("Failed to update employee. Please try again.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    await deleteUserAPI(id);
    fetchEmployees();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-inter">
      {message && (
        <div
          className={`p-4 mb-6 rounded-xl text-center ${
            isSuccess
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          } shadow-md animate-fade-in w-full max-w-lg`}
        >
          {message}
        </div>
      )}

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
          setMessage("");
        }}
        title={`Edit Employee: ${editingEmployee?.name || ""}`}
      >
        {editingEmployee && (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-gray-800 bg-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="edit-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-gray-800 bg-white"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="edit-type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="edit-type"
                name="type"
                value={editFormData.type}
                onChange={handleEditChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-gray-800 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="edit-role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </label>
              <select
                id="edit-role"
                name="role"
                value={editFormData.role}
                onChange={handleEditChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-gray-800 bg-white"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="admin">Staff</option>
                <option value="admin">Subadmin</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Permissions */}
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Permissions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {permissionFields.map((permission) => (
                <div key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`edit-${permission.id}`}
                    name={permission.id}
                    checked={editFormData[permission.id]}
                    onChange={handleEditChange}
                    className="h-6 w-6 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-colors duration-200"
                  />
                  <label
                    htmlFor={`edit-${permission.id}`}
                    className="ml-3 text-base font-medium text-gray-700 cursor-pointer"
                  >
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                  setMessage("");
                }}
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl shadow-md hover:bg-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300"
              >
                Update Employee
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Employee Table */}
      <div className="w-full max-w-7xl bg-white p-8 rounded-3xl shadow-3xl border border-gray-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          All Employees
        </h2>
        {employees.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No employees found. Add some!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.role}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {permissionFields.map(
                          (perm) =>
                            employee[perm.id] && (
                              <span
                                key={perm.id}
                                className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"
                              >
                                {perm.label}
                              </span>
                            )
                        )}
                        {permissionFields.every(
                          (perm) => !employee[perm.id]
                        ) && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            No Permissions
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-4">
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 transform hover:scale-110"
                        title="Edit Employee"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 transform hover:scale-110"
                        title="Delete Employee"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
};
