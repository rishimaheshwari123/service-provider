import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveAds } from "@/service/operations/ads";

function AdSlider() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all ads
  const getAllAds = async () => {
    try {
      setLoading(true);
      const adsList = await getActiveAds();
      setAds(adsList);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllAds();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 5000); // Change ad every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ads]);

  // Handle manual navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
  };

  // Handle ad click
  const handleAdClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 text-center text-gray-500 h-64 flex justify-center items-center">
        <p>No ads to display at the moment.</p>
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="relative w-full overflow-hidden bg-white rounded-xl shadow-lg group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd._id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <a
            href={currentAd.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handleAdClick(currentAd.url);
            }}
            className="block relative"
          >
            <img
              src={currentAd.image}
              alt="Ad"
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-xl font-semibold flex items-center gap-2">
                Visit Now <FaExternalLinkAlt />
              </span>
            </div>
          </a>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows (visible on hover) */}
      <div className="absolute inset-0 flex justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={goToPrev}
          className="bg-black bg-opacity-50 text-white p-2 rounded-full transform -translate-x-1/2 hover:scale-110 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="bg-black bg-opacity-50 text-white p-2 rounded-full transform translate-x-1/2 hover:scale-110 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AdSlider;
