import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { signUp } from "@/service/operations/auth";
import { GetAllEmployee } from "./GetAllEmployee";

export const AddRoles = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "",
    isvendor: false,
    isProperties: false,
    isInquiry: false,
    isBlog: false,
    isAppicatoin: false,
    isJob: false,
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Handles changes to form input fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handles form submission
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
          password: "",
          type: "",
          isvendor: false,
          isProperties: false,
          isInquiry: false,
          isBlog: false,
          isAppicatoin: false,
          isJob: false,
        });
        setShowForm(false);
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-inter">
      {/* Title */}
      <h1 className="text-5xl font-extrabold text-gray-900 mb-8 mt-12 text-center drop-shadow-lg">
        Employee Management Portal
      </h1>

      {/* Create Employee Button */}
      <button
        onClick={() => {
          setShowForm(!showForm);
        }}
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

      {/* Employee Creation Form */}
      {showForm && (
        <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-3xl transform scale-95 opacity-0 animate-scale-in-fade-in sm:p-8 md:p-10 border border-gray-200">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Register Employee
          </h2>
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm placeholder-gray-400 text-gray-800"
                placeholder="Enter employee's full name"
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm placeholder-gray-400 text-gray-800"
                placeholder="employee@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm placeholder-gray-400 text-gray-800"
                placeholder="Set a secure password"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
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

            {/* Permission Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pt-2">
              {[
                { id: "isvendor", label: "Is Partner" },
                { id: "isProperties", label: "Is Services" },
                { id: "isInquiry", label: "Is Inquiry" },
                { id: "isBlog", label: "Is Blog" },
                { id: "isAppicatoin", label: "Is Application" },
                { id: "isJob", label: "Is Job" },
              ].map((permission) => (
                <div key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission.id}
                    name={permission.id}
                    checked={formData[permission.id]}
                    onChange={handleChange}
                    className="h-6 w-6 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-colors duration-200"
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 mt-6"
            >
              Add Employee
            </button>
          </form>
        </div>
      )}
      {/* Tailwind CSS Customization (for animations) */}
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

      <GetAllEmployee />
    </div>
  );
};
