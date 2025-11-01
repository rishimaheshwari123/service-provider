import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  updateVendorWorkingHoursAPI,
  getVendorByIdAPI,
} from "@/service/operations/vendor";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";

interface WorkingHour {
  start: string;
  end: string;
  available: boolean;
}

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const UpdateWorkingHoursPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHour>>(
    {} as Record<string, WorkingHour>
  );
  const [loading, setLoading] = useState(false);

  const fetchWorkingHours = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const vendor = await getVendorByIdAPI(user._id);
      if (vendor?.workingHours) {
        setWorkingHours(vendor.workingHours);
      }
    } catch (error) {
      console.error("Fetch working hours error:", error);
      toast.error("Failed to fetch working hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, [user]);

  const handleChange = (
    day: string,
    field: "start" | "end" | "available",
    value: string | boolean
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!user?._id) return;
    const dataToSend = { workingHours };
    await updateVendorWorkingHoursAPI(user._id, dataToSend);
  };

  if (loading)
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Update Working Hours
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map((day) => {
          const isAvailable = workingHours[day]?.available;
          return (
            <div
              key={day}
              className={`p-4 rounded-lg shadow-md transition-all duration-200 ${
                isAvailable ? "bg-white" : "bg-gray-100 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium capitalize text-gray-700">
                  {day}
                </span>
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAvailable || false}
                    onChange={(e) =>
                      handleChange(day, "available", e.target.checked)
                    }
                    className="w-5 h-5 accent-blue-600"
                  />
                  Available
                </label>
              </div>
              <div className="flex gap-3">
                <input
                  type="time"
                  value={isAvailable ? workingHours[day]?.start || "" : ""}
                  onChange={(e) => handleChange(day, "start", e.target.value)}
                  disabled={!isAvailable}
                  className={`flex-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                    isAvailable ? "bg-white" : "bg-gray-200 cursor-not-allowed"
                  }`}
                />
                <input
                  type="time"
                  value={isAvailable ? workingHours[day]?.end || "" : ""}
                  onChange={(e) => handleChange(day, "end", e.target.value)}
                  disabled={!isAvailable}
                  className={`flex-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                    isAvailable ? "bg-white" : "bg-gray-200 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200"
        >
          Update Working Hours
        </button>
      </div>
    </div>
  );
};

export default UpdateWorkingHoursPage;
