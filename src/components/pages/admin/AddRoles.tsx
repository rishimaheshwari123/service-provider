import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { signUp } from "@/service/operations/auth";
import { GetAllEmployee } from "./GetAllEmployee";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export const AddRoles = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    type: "",
    role: "",
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
    isCoupen: false,
    isLogs: false,
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    try {
      const response = await signUp(formData);
      if (response.success) {
        setIsSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          type: "",
          role: "",
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
          isCoupen: false,
          isLogs: false,
        });
        setShowForm(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      setIsSuccess(false);
    }
  };

  if (!user?.isEmpManage) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-inter">
      <h1 className="text-sm md:text-4xl font-extrabold text-gray-900 mb-8 mt-12 text-center drop-shadow-lg">
        Employee Management Portal
      </h1>

      {/* Toggle Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-full shadow-xl hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 mb-10 group"
      >
        {showForm ? (
          <>
            <X className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
            <span>Close Form</span>
          </>
        ) : (
          <>
            <Plus className="mr-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-300" />
            <span>Add New Employee</span>
          </>
        )}
      </button>

      {/* Form */}
      {showForm && (
        <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-3xl animate-scale-in-fade-in border border-gray-200">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Register Employee
          </h2>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter employee's full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                placeholder="employee@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter 10-digit phone number"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                placeholder="Set a secure password"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pt-2">
              {[
                { id: "isVendor", label: "Is Vendor" },
                { id: "isBlog", label: "Is Blog" },
                { id: "isUser", label: "Is User" },
                { id: "isSupport", label: "Is Support" },
                { id: "isJob", label: "Is Job" },
                { id: "isAds", label: "Is Ads" },
                { id: "isBooking", label: "Is Booking" },
                { id: "isEmpManage", label: "Employee Manage" },
                { id: "isCategoryManage", label: "Category Manage" },
                { id: "isManageService", label: "Service Manage" },
                { id: "isCoupen", label: "Manage Coupen" },
                { id: "isLogs", label: " Manage Logs" },
              ].map((permission) => (
                <div key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission.id}
                    name={permission.id}
                    checked={formData[permission.id]}
                    onChange={handleChange}
                    className="h-6 w-6 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor={permission.id}
                    className="ml-3 text-base font-medium text-gray-700 cursor-pointer"
                  >
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all duration-300 mt-6"
            >
              Add Employee
            </button>
          </form>
        </div>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          @keyframes scaleInFadeIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in-fade-in {
            animation: scaleInFadeIn 0.5s ease-out forwards;
          }
          .shadow-3xl {
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.05);
          }
        `}
      </style>

      <GetAllEmployee refreshTrigger={refreshTrigger} />
    </div>
  );
};
