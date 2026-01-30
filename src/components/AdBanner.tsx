import { useState, useEffect } from "react";
import { FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getActiveAds } from "@/service/operations/ads";

interface AdBannerProps {
  className?: string;
  size?: "small" | "medium" | "large";
  autoRotate?: boolean;
  rotateInterval?: number;
}

export default function AdBanner({ 
  className = "", 
  size = "medium", 
  autoRotate = true, 
  rotateInterval = 5000 
}: AdBannerProps) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch ads from backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const adsData = await getActiveAds();
        setAds(adsData);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Auto-rotate ads
  useEffect(() => {
    if (ads.length > 1 && autoRotate) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [ads.length, autoRotate, rotateInterval]);

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleAdClick = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${getSizeClasses(size)} ${className}`}>
        <div className="h-full bg-gray-300 rounded-lg"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className={`relative bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${getSizeClasses(size)} ${className}`}>
      {/* Navigation buttons for multiple ads */}
      {ads.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevAd();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <FaChevronLeft className="text-white text-xs" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextAd();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <FaChevronRight className="text-white text-xs" />
          </button>
        </>
      )}

      {/* Ad content */}
      <div 
        className="relative h-full flex flex-col p-4"
        onClick={() => handleAdClick(currentAd?.url)}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-3">
          <FaExternalLinkAlt className="text-white text-sm" />
        </div>
        
        <div className="flex-grow flex flex-col justify-center">
          {currentAd?.image && (
            <img 
              src={currentAd.image} 
              alt="Advertisement" 
              className={`w-full object-cover rounded-lg mb-3 shadow-md ${getImageSizeClasses(size)}`}
            />
          )}
          <h3 className="text-white font-bold text-sm mb-1 tracking-wide">SPONSORED</h3>
          <p className="text-white/90 text-xs mb-2">Featured Advertisement</p>
          <p className="text-white/70 text-xs leading-relaxed flex-grow">Click to explore amazing offers!</p>
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <span className="text-xs font-medium">Visit Now</span>
          <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <FaExternalLinkAlt className="text-white text-xs" />
          </div>
        </div>
      </div>

      {/* Indicators for multiple ads */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-4 flex gap-1">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAdIndex(idx);
              }}
              className={`h-1 rounded-full transition-all ${
                idx === currentAdIndex ? "bg-white w-4" : "bg-white/50 w-1"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getSizeClasses(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "h-32 w-48";
    case "medium":
      return "h-48 w-64";
    case "large":
      return "h-64 w-80";
    default:
      return "h-48 w-64";
  }
}

function getImageSizeClasses(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "h-16";
    case "medium":
      return "h-24";
    case "large":
      return "h-32";
    default:
      return "h-24";
  }
}