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
    {} as Record<string, WorkingHour>,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    value: string | boolean,
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      const dataToSend = { workingHours };
      await updateVendorWorkingHoursAPI(user._id, dataToSend);
    } catch (error) {
      toast.error("Failed to update working hours");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading working hours...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50  md:ml-8 pb-5">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Working Hours
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Set your availability for each day of the week
          </p>
        </div>

        {/* Days List */}
        <div className="flex flex-col gap-3">
          {days.map((day) => {
            const isAvailable = workingHours[day]?.available ?? false;

            return (
              <div
                key={day}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${isAvailable
                  ? "bg-white border-blue-100 shadow-sm"
                  : "bg-gray-100 border-gray-200"
                  }`}
              >
                {/* Day Row */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span
                    className={`font-semibold capitalize text-base ${isAvailable ? "text-gray-800" : "text-gray-400"
                      }`}
                  >
                    {day}
                  </span>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) =>
                        handleChange(day, "available", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
                    <span
                      className={`ml-2 text-sm font-medium ${isAvailable ? "text-blue-600" : "text-gray-400"
                        }`}
                    >
                      {isAvailable ? "Open" : "Closed"}
                    </span>
                  </label>
                </div>

                {/* Time Inputs — shown inline on mobile when available */}
                {isAvailable && (
                  <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Start
                      </label>
                      <input
                        type="time"
                        value={workingHours[day]?.start || ""}
                        onChange={(e) =>
                          handleChange(day, "start", e.target.value)
                        }
                        className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        End
                      </label>
                      <input
                        type="time"
                        value={workingHours[day]?.end || ""}
                        onChange={(e) =>
                          handleChange(day, "end", e.target.value)
                        }
                        className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save Button — sticky on mobile */}
        <div className="mt-6 pb-6 sticky bottom-4 sm:static sm:pb-0">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full sm:w-auto sm:px-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Working Hours"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateWorkingHoursPage;
