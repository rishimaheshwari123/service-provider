import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTrashAlt, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";
import { createAd, getAllAds, deleteAd, updateAd } from "@/service/operations/ads";

function CreateAdd() {
  const [openCreate, setOpenCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);
  const [formData, setFormData] = useState({
    image: null,
    url: "",
  });
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const fetchAllAds = async () => {
    try {
      setLoading(true);
      const adsData = await dispatch(getAllAds());
      setAds(adsData || []);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAds();
  }, []);

  const handleSubmit = async (e) => {
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
        title: editMode ? "Updating Ad..." : "Creating Ad...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formDataToSend = new FormData();
      formDataToSend.append("url", formData.url);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editMode && editingAdId) {
        await dispatch(updateAd(editingAdId, formDataToSend, token));
      } else {
        await dispatch(createAd(formDataToSend, token));
      }
      
      Swal.close();
      Swal.fire({
        title: editMode ? "Ad updated successfully!" : "Ad created successfully!",
        icon: "success",
      });
      
      setFormData({ url: "", image: null });
      setOpenCreate(false);
      setEditMode(false);
      setEditingAdId(null);
      fetchAllAds();
    } catch (error) {
      Swal.close();
      console.error("Error with ad:", error);
    }
  };

  const handleEdit = (ad) => {
    setEditMode(true);
    setEditingAdId(ad._id);
    setFormData({
      url: ad.url,
      image: null,
    });
    setOpenCreate(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingAdId(null);
    setFormData({ url: "", image: null });
    setOpenCreate(false);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await dispatch(deleteAd(id, token));
        fetchAllAds();
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const sortedAds = [...ads].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!user?.isAds) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Ads Management Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Create, view, and manage your advertising campaigns.
          </p>
        </header>

        <div className="flex justify-end mb-6">
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
            Create New Ad
          </button>
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
                {editMode ? "Edit Ad" : "Create New Ad"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-gray-700 font-medium mb-2"
                      htmlFor="url"
                    >
                      Ad URL *
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      name="url"
                      id="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="e.g., https://example.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-medium mb-2"
                      htmlFor="image"
                    >
                      Ad Image {editMode ? "(Optional - leave empty to keep current)" : "*"}
                    </label>
                    <input
                      className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!editMode}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended size: 400x300px or similar aspect ratio
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors"
                  >
                    {editMode ? "Update Ad" : "Create Ad"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600 transition-colors"
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
            Active Ads ({ads.length})
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
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {sortedAds.length > 0 ? (
                      sortedAds.map((ad) => (
                        <motion.tr
                          key={ad._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 whitespace-nowrap">
                            <img
                              src={ad.image}
                              alt="ad"
                              className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                          </td>
                          <td className="py-4 px-6 break-words max-w-xs">
                            <a
                              href={ad.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {ad.url}
                            </a>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(ad)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50"
                                title="Edit Ad"
                              >
                                <FaEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDelete(ad._id)}
                                className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-50"
                                title="Delete Ad"
                              >
                                <FaTrashAlt className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500 text-lg"
                        >
                          No ads available. Create one to get started!
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
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
