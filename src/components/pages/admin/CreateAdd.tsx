import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = "https://service-provider-6ufz.onrender.com/api/v1";

function CreateAdd() {
  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    url: "",
  });
  const [ads, setAds] = useState([]);
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

  const getAllAds = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/ads/getAll`);
      if (!response?.data?.success) {
        throw new Error(response.data.message);
      }
      setAds(response.data.ads || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch ads.");
    }
  };

  useEffect(() => {
    getAllAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Creating Ad...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formDataToSend = new FormData();
      formDataToSend.append("url", formData.url);
      formDataToSend.append("image", formData.image);

      const response = await axios.post(
        `${BASE_URL}/ads/create`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      if (response?.data?.success) {
        Swal.fire({
          title: "Ad created successfully!",
          icon: "success",
        });
        setFormData({ url: "", image: null });
        setOpenCreate(false);
        getAllAds();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      Swal.close();
      toast.error("Oops, something went wrong!");
      console.error(error);
    }
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
        const response = await axios.delete(`${BASE_URL}/ads/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response?.data?.success) {
          toast.success("Ad deleted successfully!");
          getAllAds();
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete ad.");
    }
  };

  const sortedAds = [...ads].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
            onClick={() => setOpenCreate(!openCreate)}
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
                Create New Ad
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-gray-700 font-medium mb-2"
                      htmlFor="url"
                    >
                      Ad URL
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
                      Ad Image
                    </label>
                    <input
                      className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors"
                >
                  Create Ad
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Active Ads
          </h2>
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
                        <td className="py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(ad._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Ad"
                          >
                            <FaTrashAlt className="text-lg" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
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
        </div>
      </div>
    </div>
  );
}

export default CreateAdd;
