import React, { useState, useEffect } from "react";
import { Plus, X, Edit, Delete, DeleteIcon } from "lucide-react";
import {
  getAllUsersAPI,
  editPermissionAPI,
  deleteUserAPI,
} from "@/service/operations/auth";
import { FaTrash } from "react-icons/fa";

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-3xl max-w-lg w-full relative transform scale-95 opacity-0 animate-scale-in-fade-in border border-gray-200">
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
  const [showAddForm, setShowAddForm] = useState(false); // This state isn't currently used for showing an add form in the provided code.
  const [showEditModal, setShowEditModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Initial form data for adding an employee (if you implement an add form)
  const initialAddFormData = {
    name: "",
    email: "",
    password: "",
    type: "", // Added type
    isvendor: false,
    isProperties: false,
    isInquiry: false,
    isBlog: false,
    isAppicatoin: false, // Corrected typo here (assuming 'isAppicatoin' was intended based on original code)
    isJob: false,
  };
  const [addFormData, setAddFormData] = useState(initialAddFormData);

  // State to manage the form data for editing an employee
  const [editFormData, setEditFormData] = useState({
    name: "", // Added name
    email: "", // Added email
    type: "", // Added type
    isvendor: false,
    isProperties: false,
    isInquiry: false,
    isBlog: false,
    isAppicatoin: false, // Corrected typo here
    isJob: false,
  });

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
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setMessage("An error occurred while loading employees.");
      setIsSuccess(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handler for changes in the add form (if implemented)
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    // Populate edit form with current employee's data including name, email, and type
    setEditFormData({
      name: employee.name || "", // Added fallback for undefined
      email: employee.email || "", // Added fallback for undefined
      type: employee.type || "", // Ensure type has a default empty string if not present
      isvendor: employee.isvendor || false, // Added fallback
      isProperties: employee.isProperties || false, // Added fallback
      isInquiry: employee.isInquiry || false, // Added fallback
      isBlog: employee.isBlog || false, // Added fallback
      isAppicatoin: employee.isAppicatoin || false, // Added fallback
      isJob: employee.isJob || false, // Added fallback
    });
    setShowEditModal(true);
    setShowAddForm(false); // Close add form if open
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
      // Include name, email, and type in the data to update
      const dataToUpdate = {
        name: editFormData.name,
        email: editFormData.email,
        type: editFormData.type,
        isvendor: editFormData.isvendor,
        isProperties: editFormData.isProperties,
        isInquiry: editFormData.isInquiry,
        isBlog: editFormData.isBlog,
        isAppicatoin: editFormData.isAppicatoin,
        isJob: editFormData.isJob,
      };
      let id = editingEmployee._id; // Assuming _id is the correct identifier
      const response = await editPermissionAPI(id, dataToUpdate); // Ensure your API can handle name, email, and type updates
      if (response.success) {
        setMessage(response.message);
        setIsSuccess(true);
        setEditingEmployee(null);
        setShowEditModal(false);
        fetchEmployees(); // Refresh the list to show updated data
      } else {
        setMessage("Failed to update employee. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      setMessage("An error occurred. Please try again later.");
      setIsSuccess(false);
    }
  };

  const handleDelete = async (id) => {
    const response = await deleteUserAPI(id);
    fetchEmployees();
  };

  return (
    <div className="min-h-screen  flex flex-col items-center p-4 font-inter">
      {message && (
        <div
          className={`p-4 mb-6 rounded-xl text-center ${
            isSuccess
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } shadow-md border ${
            isSuccess ? "border-green-200" : "border-red-200"
          } animate-fade-in w-full max-w-lg`}
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
            {/* Name Field */}
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

            {/* Email Field */}
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

            {/* Type Dropdown */}
            <div>
              <label
                htmlFor="edit-type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <select
                id="edit-type"
                name="type"
                value={editFormData.type}
                onChange={handleEditChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-gray-800 bg-white"
              >
                <option value="">Select type</option>
                <option value="ca">CA</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="worker">Worker</option>
                <option value="subadmin">Subadmin</option>
                <option value="other">Other</option>
              </select>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Permissions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {[
                { id: "isvendor", label: "Is Partner" },
                { id: "isProperties", label: "Is Services" },
                { id: "isInquiry", label: "Is Inquiry" },
                { id: "isBlog", label: "Is Blog" },
                { id: "isAppicatoin", label: "Is Application" }, // Corrected label for clarity
                { id: "isJob", label: "Is Job" },
              ].map((permission) => (
                <div
                  key={`edit-${permission.id}`}
                  className="flex items-center"
                >
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

      {/* Employee List Table */}
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Permissions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr
                    key={employee._id} // Changed to _id, assuming this is your unique identifier
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {employee.type || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {employee.isvendor && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Vendor
                          </span>
                        )}
                        {employee.isProperties && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Properties
                          </span>
                        )}
                        {employee.isInquiry && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            Inquiry
                          </span>
                        )}
                        {employee.isBlog && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Blog
                          </span>
                        )}
                        {employee.isAppicatoin && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            Application
                          </span>
                        )}
                        {employee.isJob && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-800">
                            Job
                          </span>
                        )}
                        {!employee.isvendor &&
                          !employee.isProperties &&
                          !employee.isInquiry &&
                          !employee.isBlog &&
                          !employee.isAppicatoin &&
                          !employee.isJob && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              No Specific Permissions
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 transform hover:scale-110 mr-4"
                        title="Edit Permissions"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 transform hover:scale-110 mr-4"
                        title="Edit Permissions"
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

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleInFadeIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          .animate-scale-in-fade-in {
            animation: scaleInFadeIn 0.5s ease-out forwards;
          }
          .shadow-3xl {
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.05);
          }
        `}
      </style>
    </div>
  );
};
