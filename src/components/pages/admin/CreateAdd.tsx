import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Power,
  UploadCloud,
  Globe,
  Calendar,
  User,
  Phone,
  AlertTriangle,
  ExternalLink,
  Clock
} from "lucide-react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    image: null as File | null,
    url: "",
  });

  const canOpenCreate = (isAdmin && activeTab === "admin") || isVendor;

  const headerTitle = useMemo(() => {
    if (isAdmin) return "Ads Management";
    return "Advertisements Portal";
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
    setImagePreview(null);
    setEditMode(false);
    setEditingAdId(null);
    setOpenCreate(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file only.");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      toast.error("Please provide destination URL");
      return;
    }

    if (!editMode && !formData.image) {
      toast.error("Please select an ad poster image");
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
        throw new Error("Create operation is not allowed in this context");
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
    setImagePreview(ad.image);
    setOpenCreate(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Delete this advertisement?",
        text: "This action is permanent and cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel"
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
      title: "Reject vendor poster?",
      input: "text",
      inputLabel: "Reason for rejection (optional)",
      inputPlaceholder: "Enter reason...",
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

  const sortedAds = useMemo(() => {
    return [...ads].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [ads]);

  // Dynamic statistics calculations
  const totalCount = sortedAds.length;
  const activeCount = sortedAds.filter((ad) => ad.isActive).length;
  const pendingCount = sortedAds.filter((ad) => ad.approvalStatus === "pending").length;
  const rejectedCount = sortedAds.filter((ad) => ad.approvalStatus === "rejected").length;

  const getApprovalBadge = (status?: ApprovalStatus) => {
    const currentStatus = status || "pending";
    if (currentStatus === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
          Approved
        </span>
      );
    }
    if (currentStatus === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Pending Review
      </span>
    );
  };

  const getActiveBadge = (isActive?: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 shadow-sm">
        Inactive
      </span>
    );
  };

  if (isAdmin && !user?.isAds) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center bg-white p-8 rounded-xl border border-red-100 shadow-lg max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">
            You do not have administrative permissions to view or manage ads dashboards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-4 md:p-8 font-sans">
      <div className="w-full mx-auto max-w-7xl">

        {/* Sleek Premium Page Header */}
        <header className="mb-8 bg-indigo-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
            <UploadCloud className="w-80 h-80" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{headerTitle}</h1>
            <p className="text-indigo-200 text-sm mt-2 max-w-2xl leading-relaxed">
              {isAdmin
                ? "Review poster placements, authorize partner vendor submissions, and configure layout banners across primary directories."
                : "Promote your services by uploading poster creatives. Note that administration review is required prior to banner activation."}
            </p>
          </div>
        </header>

        {/* Dynamic Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-250">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {isAdmin ? "Total Ads" : "My Uploads"}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-250">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-650">{activeCount}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {isAdmin ? "Active Ads" : "Live Banners"}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-250">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Pending Review
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-250">
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600">{rejectedCount}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Rejected / Flagged
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection & Dropdowns (Admin Only) */}
        {isAdmin && (
          <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

              {/* Tabs */}
              <div className="flex flex-col sm:flex-row bg-gray-100 p-1 rounded-xl w-full xl:w-auto gap-2 sm:gap-1">

                {/* Admin Ads */}
                <button
                  onClick={() => {
                    setActiveTab("admin");
                    setStatusFilter("all");
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "admin"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  Admin Ads
                </button>

                {/* Vendor Ads */}
                <button
                  onClick={() => {
                    setActiveTab("vendor");
                    setStatusFilter("all");
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "vendor"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <User className="w-4 h-4" />
                  Vendor Ads
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full xl:w-auto">

                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:block">
                  Filter Status:
                </span>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                      | "all"
                      | "pending"
                      | "approved"
                      | "rejected"
                    )
                  }
                  className="w-full sm:w-64 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                >
                  <option value="all">All Submissions</option>
                  <option value="pending">⏳ Pending Review</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section Title & Creation Trigger Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800">
              {isAdmin
                ? `${activeTab === "admin" ? "Internal Advertisements" : "Vendor Poster Applications"} (${sortedAds.length})`
                : `My Poster Creative Queue (${sortedAds.length})`}
            </h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage and monitor live screen spaces</p>
          </div>
          {canOpenCreate && (
            <button
              onClick={() => {
                setEditMode(false);
                setEditingAdId(null);
                setFormData({ url: "", image: null });
                setImagePreview(null);
                setOpenCreate(!openCreate);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold rounded-xl shadow-sm transition-all duration-150 w-full sm:w-auto text-sm"
            >
              <Plus className="w-4 h-4" />
              {isVendor ? "Upload New Poster" : "Create New Ad"}
            </button>
          )}
        </div>

        {/* Create / Edit Form Expansion */}
        <AnimatePresence>
          {openCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  {editMode ? (
                    <>
                      <Edit3 className="w-5 h-5 text-indigo-600" /> Edit Advertisement Placement
                    </>
                  ) : isVendor ? (
                    <>
                      <UploadCloud className="w-5 h-5 text-indigo-600" /> Submit Poster Proposal
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-indigo-600" /> Launch Internal Advertisement
                    </>
                  )}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* URL Link and Guidelines */}
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700" htmlFor="url">
                          Destination Link *
                        </label>
                        <input
                          type="url"
                          className="w-full px-4 py-3.5 border border-gray-250 rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm font-medium"
                          name="url"
                          id="url"
                          value={formData.url}
                          onChange={handleChange}
                          placeholder="https://example.com/target-link"
                          required
                        />
                        <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                          Enter the full web address (with HTTP/HTTPS) where users will navigate when clicking this banner poster.
                        </p>
                      </div>

                      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start space-x-3 text-indigo-900 text-xs">
                        <AlertTriangle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold">Compliance Standard:</span>
                          <p className="text-indigo-750 font-medium leading-relaxed">
                            {isVendor
                              ? "Vendor advertisements must strictly avoid low-resolution artwork or malicious link targets. General approvals take between 12-24 hours depending on banner slots."
                              : "Administrative placements bypass the standard verification and review cycles. Please verify destination path links carefully prior to deployment."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Drag and Drop File Upload Area */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Poster Creative {editMode ? "(Optional)" : "*"}
                      </label>

                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 min-h-[220px] flex flex-col justify-center items-center ${isDragging
                          ? "border-indigo-600 bg-indigo-50/30 scale-[0.98]"
                          : imagePreview
                            ? "border-gray-300 bg-gray-50/50 hover:bg-gray-100/50"
                            : "border-gray-350 hover:border-indigo-400 bg-white"
                          }`}
                      >
                        <input
                          ref={fileInputRef}
                          className="hidden"
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required={!editMode}
                        />

                        {imagePreview ? (
                          <div className="relative group w-full h-[180px] rounded-xl overflow-hidden flex items-center justify-center bg-black/5 border border-gray-150">
                            <img
                              src={imagePreview}
                              alt="Poster Preview"
                              className="max-h-[170px] max-w-full object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <span className="text-white text-xs font-bold bg-black/60 px-4 py-2 rounded-full flex items-center gap-1.5 border border-white/20">
                                <UploadCloud className="w-4 h-4" />
                                Replace Selected Artwork
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((prev) => ({ ...prev, image: null }));
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white p-2 rounded-full shadow-md transition-all duration-150 z-10 border border-rose-450"
                              title="Clear visual selection"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 flex flex-col items-center">
                            <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                              <UploadCloud className="w-8 h-8 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                                Select poster file
                              </span>{" "}
                              <span className="text-sm text-gray-500 font-medium">
                                or drag and drop artwork here
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-bold">
                              Accepts JPG, PNG, WEBP (Recommended: 400x300px, Max: 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission and Cancel Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-850 text-white font-extrabold rounded-xl shadow-sm transition-all duration-150 text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      {editMode ? "Save Changes" : isVendor ? "Submit Poster Proposal" : "Launch Ad Creative"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-250 text-gray-700 font-bold rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ads Main Grid Card / Table Display */}
        <div className="bg-transparent md:bg-white rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-200 p-0 md:p-6 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 font-semibold mt-3 text-sm">Synchronizing advertisements...</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Desktop Table View (hidden on small viewports) */}
              <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-250 bg-white">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="py-4 px-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Poster</th>
                      <th className="py-4 px-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Destination Link</th>
                      {isAdmin && activeTab === "vendor" && (
                        <th className="py-4 px-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor details</th>
                      )}
                      <th className="py-4 px-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Approval</th>
                      <th className="py-4 px-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="py-4 px-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedAds.length > 0 ? (
                      sortedAds.map((ad) => (
                        <tr key={ad._id} className="hover:bg-gray-50/30 transition-colors duration-150">
                          <td className="py-4 px-5">
                            <div className="relative group w-24 h-18 rounded-lg overflow-hidden border border-gray-150 shadow-sm bg-gray-100 flex items-center justify-center">
                              <img
                                src={ad.image}
                                alt="Banner Poster"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-5 max-w-[280px]">
                            <a
                              href={ad.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-650 hover:text-indigo-850 hover:underline max-w-full truncate"
                            >
                              <ExternalLink className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                              {ad.url}
                            </a>
                            {ad.rejectionReason && (
                              <div className="mt-1.5 p-2 bg-rose-50 rounded-lg border border-rose-100 text-xs text-rose-700 flex items-start gap-1 max-w-xs">
                                <span className="font-semibold flex-shrink-0">Reason:</span>
                                <span className="italic leading-relaxed">{ad.rejectionReason}</span>
                              </div>
                            )}
                          </td>
                          {isAdmin && activeTab === "vendor" && (
                            <td className="py-4 px-5 text-sm text-gray-700">
                              <div className="flex flex-col space-y-0.5">
                                <span className="font-bold text-gray-900">{ad.vendorId?.name || "N/A"}</span>
                                {ad.vendorId?.phone && (
                                  <span className="inline-flex items-center text-xs text-gray-500 font-semibold">
                                    <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                    {ad.vendorId.phone}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="py-4 px-5">
                            {getApprovalBadge(ad.approvalStatus)}
                          </td>
                          <td className="py-4 px-5">
                            {getActiveBadge(ad.isActive)}
                          </td>
                          <td className="py-4 px-5 text-sm text-gray-500 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-405" />
                              {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right pr-6">
                            <div className="flex justify-end gap-1.5">
                              {isAdmin && activeTab === "admin" && (
                                <>
                                  <button
                                    onClick={() => handleEdit(ad)}
                                    className="text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggle(ad)}
                                    className={`p-2 rounded-lg border transition-all duration-150 cursor-pointer shadow-sm hover:shadow ${ad.isActive
                                      ? "text-amber-605 hover:bg-amber-50 border-transparent hover:border-amber-100"
                                      : "text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-100"
                                      }`}
                                    title={ad.isActive ? "Pause ad placement" : "Publish ad placement"}
                                  >
                                    <Power className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(ad._id)}
                                    className="text-rose-600 p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                    title="Delete ad permanent"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {isAdmin && activeTab === "vendor" && (
                                <>
                                  {ad.approvalStatus === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(ad._id)}
                                        className="text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                        title="Approve Proposal"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleReject(ad._id)}
                                        className="text-rose-700 p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                        title="Reject Proposal"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  {ad.approvalStatus === "approved" && (
                                    <button
                                      onClick={() => handleToggle(ad)}
                                      className={`p-2 rounded-lg border transition-all duration-150 cursor-pointer shadow-sm hover:shadow ${ad.isActive
                                        ? "text-amber-605 hover:bg-amber-50 border-transparent hover:border-amber-100"
                                        : "text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-100"
                                        }`}
                                      title={ad.isActive ? "Deactivate" : "Activate"}
                                    >
                                      <Power className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}

                              {isVendor && (
                                <>
                                  <button
                                    onClick={() => handleDelete(ad._id)}
                                    className="text-rose-600 p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                    title="Delete Poster Submission"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin && activeTab === "vendor" ? 7 : 6} className="text-center py-20 text-gray-500 font-bold bg-white">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <UploadCloud className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-500 font-extrabold text-base">No active ads configured</p>
                            <p className="text-xs text-gray-400 font-medium">Create a new advertisement layout or adjust filter scopes.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (hidden on large viewports) */}
              <div className="block md:hidden">
                {sortedAds.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {sortedAds.map((ad) => (
                      <div
                        key={ad._id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
                      >
                        {/* Image Header with Badge Overlays */}
                        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-150">
                          <img
                            src={ad.image}
                            alt="Poster artwork"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
                            {getApprovalBadge(ad.approvalStatus)}
                            {getActiveBadge(ad.isActive)}
                          </div>
                        </div>

                        {/* Card Content details */}
                        <div className="p-4 flex-1 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block">Destination URL</span>
                            <a
                              href={ad.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-650 hover:text-indigo-850 hover:underline max-w-full break-all"
                            >
                              <ExternalLink className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                              {ad.url}
                            </a>
                          </div>

                          {isAdmin && activeTab === "vendor" && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 space-y-1.5">
                              <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block">Proposed Partner</span>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">{ad.vendorId?.name || "Unknown Partner"}</span>
                                {ad.vendorId?.phone && (
                                  <span className="inline-flex items-center text-xs text-gray-500 font-semibold mt-1">
                                    <Phone className="w-3.5 h-3.5 mr-1 text-gray-400 animate-pulse" />
                                    {ad.vendorId.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {ad.rejectionReason && (
                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700 space-y-1">
                              <span className="font-bold uppercase tracking-wider text-[9px] text-rose-600 block">Verification Warning</span>
                              <p className="italic leading-relaxed font-semibold">{ad.rejectionReason}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold pt-2.5 border-t border-gray-100">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-350" />
                              Created: {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Sticky Action Panel at bottom */}
                        <div className="px-4 py-3 bg-gray-50/75 border-t border-gray-150 flex gap-2">
                          {isAdmin && activeTab === "admin" && (
                            <>
                              <button
                                onClick={() => handleEdit(ad)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer shadow-sm"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggle(ad)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer shadow-sm ${ad.isActive
                                  ? "bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100"
                                  : "bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                                {ad.isActive ? "Pause" : "Start"}
                              </button>
                              <button
                                onClick={() => handleDelete(ad._id)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 border border-rose-150 hover:bg-rose-100 text-rose-705 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </>
                          )}

                          {isAdmin && activeTab === "vendor" && (
                            <>
                              {ad.approvalStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(ad._id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer shadow-md"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(ad._id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer shadow-md"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {ad.approvalStatus === "approved" && (
                                <button
                                  onClick={() => handleToggle(ad)}
                                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer shadow-sm ${ad.isActive
                                    ? "bg-amber-50 border-amber-155 text-amber-700 hover:bg-amber-100"
                                    : "bg-emerald-50 border-emerald-155 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  {ad.isActive ? "Pause Banner Artwork" : "Resume Banner Artwork"}
                                </button>
                              )}
                            </>
                          )}

                          {isVendor && (
                            <>
                              <button
                                onClick={() => handleDelete(ad._id)}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 border border-rose-150 hover:bg-rose-105 text-rose-705 rounded-xl text-xs font-extrabold transition-colors duration-150 cursor-pointer shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove Poster Submission
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UploadCloud className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-extrabold text-base">No active ads configured</p>
                      <p className="text-xs text-gray-400 font-medium">Submit a new poster proposal or adjust filter scopes.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CreateAdd;
