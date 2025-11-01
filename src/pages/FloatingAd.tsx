import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = "https://service-provider-6ufz.onrender.com/api/v1";

function FloatingAd() {
  const [ad, setAd] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch a single random ad to display
  const getSingleAd = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/ads/getAll`);
      if (response?.data?.success && response.data.ads.length > 0) {
        const ads = response.data.ads;
        const randomIndex = Math.floor(Math.random() * ads.length);
        setAd(ads[randomIndex]);
      } else {
        setAd(null); // No ads to display
      }
    } catch (error) {
      console.error("Failed to fetch ad:", error);
      toast.error("Failed to load ad.");
      setAd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSingleAd();
  }, []);

  // Handle ad click
  const handleAdClick = () => {
    if (ad && ad.url) {
      window.open(ad.url, "_blank", "noopener noreferrer");
    }
  };

  // Handle closing the ad
  const handleClose = () => {
    setIsVisible(false);
  };

  // If the ad is not visible or no ad is available, render nothing
  if (!isVisible || !ad) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md cursor-pointer"
        >
          <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden p-2">
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the ad click event from firing
                handleClose();
              }}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors z-10"
              aria-label="Close ad"
            >
              <FaTimes />
            </button>

            {/* Ad content */}
            <div onClick={handleAdClick} className="relative">
              <img
                src={ad.image}
                alt="Ad"
                className="w-full h-auto object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-semibold flex items-center gap-1">
                  Visit Now <FaExternalLinkAlt className="text-xs" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingAd;
