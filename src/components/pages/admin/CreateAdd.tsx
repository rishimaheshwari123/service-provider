import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaEdit, FaPlusCircle, FaPowerOff, FaTimes, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  approveVendorAd,
  createAdminAd,
  createVendorAd,
  deleteAd,
  getManageAds,
  getVendorAds,
  rejectVendorAd,
  toggleAdStatus,
  updateAd,
} from "@/service/operations/ads";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const ACTIVE_STYLES: Record<string, string> = {
  on: "bg-emerald-100 text-emerald-800",
  off: "bg-slate-200 text-slate-700",
};

type ApprovalStatus = "pending" | "approved" | "rejected";

interface VendorLite {
  name?: string;
  phone?: string;
}

interface AdItem {
  _id: string;
  image: string;
  url: string;
  createdAt: string;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
  rejectionReason?: string;
  vendorId?: VendorLite;
}

function CreateAdd() {
  const { token, user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";

  const [openCreate, setOpenCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"admin" | "vendor">(isAdmin ? "admin" : "vendor");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    image: null as File | null,
    url: "",
  });

  const canOpenCreate = (isAdmin && activeTab === "admin") || isVendor;

  const headerTitle = useMemo(() => {
    if (isAdmin) return "Ads Management Dashboard";
    return "Vendor Ads Dashboard";
  }, [isAdmin]);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      let adsData: AdItem[] = [];

      if (isAdmin) {
        adsData = await getManageAds(activeTab, statusFilter === "all" ? "" : statusFilter)();
      } else if (isVendor && user?._id) {
        adsData = await getVendorAds(user._id)();
      }

      setAds(Array.isArray(adsData) ? adsData : []);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, isAdmin, isVendor, statusFilter, user?._id]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const resetForm = () => {
    setFormData({ image: null, url: "" });
    setEditMode(false);
    setEditingAdId(null);
    setOpenCreate(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, image: e.target.files?.[0] || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      toast.error("Please provide URL");
      return;
    }

    if (!editMode && !formData.image) {
      toast.error("Please provide an image");
      return;
    }

    try {
      Swal.fire({
        title: editMode ? "Updating Ad..." : "Submitting Ad...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = new FormData();
      payload.append("url", formData.url);
      if (formData.image) payload.append("image", formData.image);

      if (editMode && editingAdId) {
        await updateAd(editingAdId, payload, token)();
      } else if (isAdmin && activeTab === "admin") {
        await createAdminAd(payload, token, user?._id)();
      } else if (isVendor) {
        await createVendorAd(payload, token, user?._id)();
      } else {
        throw new Error("Create operation is not allowed in this tab");
      }

      Swal.close();
      fetchAds();
      resetForm();
    } catch (error) {
      Swal.close();
      console.error("Error saving ad:", error);
    }
  };

  const handleEdit = (ad: AdItem) => {
    setEditMode(true);
    setEditingAdId(ad._id);
    setFormData({
      url: ad.url,
      image: null,
    });
    setOpenCreate(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Delete ad?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
      });
      if (!result.isConfirmed) return;
      await deleteAd(id, token)();
      fetchAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const handleApprove = async (id: string) => {
    await approveVendorAd(id, user?._id, token)();
    fetchAds();
  };

  const handleReject = async (id: string) => {
    const result = await Swal.fire({
      title: "Reject vendor ad?",
      input: "text",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Enter rejection reason",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;
    await rejectVendorAd(id, user?._id, String(result.value || ""), token)();
    fetchAds();
  };

  const handleToggle = async (ad: AdItem) => {
    await toggleAdStatus(ad._id, !ad.isActive, token)();
    fetchAds();
  };

  const sortedAds = [...ads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isAdmin && !user?.isAds) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{headerTitle}</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "Manage admin ads and vendor ad approvals."
              : "Upload your posters. Admin approval is required before activation."}
          </p>
        </header>

        {isAdmin && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 rounded-full font-medium ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Admin Ads
            </button>
            <button
              onClick={() => setActiveTab("vendor")}
              className={`px-4 py-2 rounded-full font-medium ${
                activeTab === "vendor"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Vendor Ads
            </button>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")
              }
              className="ml-auto px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        <div className="flex justify-end mb-6">
          {canOpenCreate && (
            <button
              onClick={() => {
                setEditMode(false);
                setEditingAdId(null);
                setFormData({ url: "", image: null });
                setOpenCreate(!openCreate);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-transform duration-200 transform hover:scale-105"
            >
              <FaPlusCircle className="text-lg" />
              {isVendor ? "Upload Poster" : "Create New Ad"}
            </button>
          )}
        </div>

        <AnimatePresence>
          {openCreate && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-lg mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {editMode ? "Edit Ad" : isVendor ? "Upload Vendor Ad" : "Create Admin Ad"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="url">
                      Ad URL *
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      name="url"
                      id="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                      Ad Image {editMode ? "(Optional)" : "*"}
                    </label>
                    <input
                      className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!editMode}
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 400x300px</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700"
                  >
                    {editMode ? "Update Ad" : isVendor ? "Submit for Approval" : "Create Ad"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {isAdmin
              ? `${activeTab === "admin" ? "Admin Ads" : "Vendor Ads"} (${sortedAds.length})`
              : `My Ads (${sortedAds.length})`}
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading ads...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                    {isAdmin && activeTab === "vendor" && (
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    )}
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAds.length > 0 ? (
                    sortedAds.map((ad) => (
                      <tr key={ad._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <img src={ad.image} alt="ad" className="w-24 h-20 object-cover rounded-lg shadow" />
                        </td>
                        <td className="py-4 px-4 break-words max-w-xs">
                          <a
                            href={ad.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            {ad.url}
                          </a>
                          {ad.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">Reason: {ad.rejectionReason}</p>
                          )}
                        </td>
                        {isAdmin && activeTab === "vendor" && (
                          <td className="py-4 px-4 text-sm text-gray-700">
                            {ad.vendorId?.name || "-"}
                            <p className="text-xs text-gray-500">{ad.vendorId?.phone || ""}</p>
                          </td>
                        )}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              STATUS_STYLES[ad.approvalStatus] || STATUS_STYLES.pending
                            }`}
                          >
                            {ad.approvalStatus || "pending"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ad.isActive ? ACTIVE_STYLES.on : ACTIVE_STYLES.off
                            }`}
                          >
                            {ad.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            {isAdmin && activeTab === "admin" && (
                              <>
                                <button
                                  onClick={() => handleEdit(ad)}
                                  className="text-blue-600 p-2 rounded-full hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleToggle(ad)}
                                  className="text-emerald-600 p-2 rounded-full hover:bg-emerald-50"
                                  title={ad.isActive ? "Deactivate" : "Activate"}
                                >
                                  <FaPowerOff />
                                </button>
                                <button
                                  onClick={() => handleDelete(ad._id)}
                                  className="text-red-600 p-2 rounded-full hover:bg-red-50"
                                  title="Delete"
                                >
                                  <FaTrashAlt />
                                </button>
                              </>
                            )}

                            {isAdmin && activeTab === "vendor" && (
                              <>
                                {ad.approvalStatus === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(ad._id)}
                                      className="text-emerald-700 p-2 rounded-full hover:bg-emerald-50"
                                      title="Approve"
                                    >
                                      <FaCheck />
                                    </button>
                                    <button
                                      onClick={() => handleReject(ad._id)}
                                      className="text-red-700 p-2 rounded-full hover:bg-red-50"
                                      title="Reject"
                                    >
                                      <FaTimes />
                                    </button>
                                  </>
                                )}
                                {ad.approvalStatus === "approved" && (
                                  <button
                                    onClick={() => handleToggle(ad)}
                                    className="text-indigo-700 p-2 rounded-full hover:bg-indigo-50"
                                    title={ad.isActive ? "Deactivate" : "Activate"}
                                  >
                                    <FaPowerOff />
                                  </button>
                                )}
                              </>
                            )}

                            {isVendor && (
                              <>
                                <button
                                  onClick={() => handleDelete(ad._id)}
                                  className="text-red-600 p-2 rounded-full hover:bg-red-50"
                                  title="Delete"
                                >
                                  <FaTrashAlt />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin && activeTab === "vendor" ? 7 : 6} className="text-center py-8 text-gray-500">
                        No ads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateAdd;
