import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaBroom, FaTools, FaSpa, FaExternalLinkAlt } from "react-icons/fa";
import { getActiveAds } from "@/service/operations/ads";
import { getAllCategoriesAPI } from "@/service/operations/category";

export default function PromoBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [availableCategories, setAvailableCategories] = useState([]);

  const mainBanners = [
    {
      title: t("promoBanner.cleaning.title", "Professional Cleaning Services"),
      subtitle: t("promoBanner.cleaning.subtitle", "Trained & Verified Cleaners"),
      tagline: t("promoBanner.cleaning.tagline", "Spotless Homes, Happy Families"),
      buttonText: t("common.bookNow", "Book Now"),
      bgColor: "bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      accentColor: "text-blue-600",
    },
    {
      title: t("promoBanner.repairing.title", "Expert Repair Services"),
      subtitle: t("promoBanner.repairing.subtitle", "Skilled Technicians at Your Doorstep"),
      tagline: t("promoBanner.repairing.tagline", "Quick & Reliable Repairs"),
      buttonText: t("promoBanner.getService", "Get Service"),
      bgColor: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      accentColor: "text-orange-600",
    },
    {
      title: t("promoBanner.yoga.title", "Yoga & Wellness Sessions"),
      subtitle: t("promoBanner.yoga.subtitle", "Certified Yoga Instructors"),
      tagline: t("promoBanner.yoga.tagline", "Transform Your Mind & Body"),
      buttonText: t("promoBanner.joinNow", "Join Now"),
      bgColor: "bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      accentColor: "text-emerald-600",
    },
  ];

  const promoCards = [
    {
      title: t("promoBanner.cards.cleaning.title", "HOME SERVICE"),
      subtitle: t("promoBanner.cards.cleaning.subtitle", "Home & Office Services"),
      description: t("promoBanner.cards.cleaning.description", "Professional home services by trained experts"),
      icon: FaBroom,
      bgColor: "from-blue-600 via-blue-500 to-cyan-500",
      // Filter by autoFilled field for home services - include all variations found in data
      filterType: "autoFilled",
      filterValues: ["Home Service", "Home Services", "HOME SERVICE", "Home service", "home service"],
    },
    {
      title: t("promoBanner.cards.repairing.title", "REPAIRING"),
      subtitle: t("promoBanner.cards.repairing.subtitle", "All Repair Solutions"),
      description: t("promoBanner.cards.repairing.description", "Expert technicians for all repairs"),
      icon: FaTools,
      bgColor: "from-orange-600 via-orange-500 to-amber-500",
      // Filter by autoFilled field for repairing services
      filterType: "autoFilled",
      filterValues: ["Repairing"],
    },
    {
      title: t("promoBanner.cards.yoga.title", "HEALTH CARE"),
      subtitle: t("promoBanner.cards.yoga.subtitle", "Health & Wellness Care"),
      description: t("promoBanner.cards.yoga.description", "Certified health professionals for wellness including yoga"),
      icon: FaSpa,
      bgColor: "from-emerald-600 via-green-500 to-teal-500",
      // Filter by autoFilled field for health care services including yoga
      filterType: "autoFilled",
      filterValues: ["Health Care", "Sports"], // Added Sports to include fitness/yoga centers
    },
  ];

  // Fetch ads and categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adsData, categoriesData] = await Promise.all([
          getActiveAds(),
          getAllCategoriesAPI()
        ]);
        setAds(adsData);
        setAvailableCategories(categoriesData || []);
        console.log("Available categories:", categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle card click with special filtering for autoFilled categories
  const handleCardClick = (card) => {
    if (card.filterType === "autoFilled") {
      // Create a special URL that will filter by multiple autoFilled values
      const filterValues = card.filterValues.join(','); // Join multiple values with comma
      const url = `/services?autoFilled=${encodeURIComponent(filterValues)}`;
      console.log("Navigating to:", url);
      window.location.href = url;
    } else {
      // Fallback to regular category filtering
      const url = `/services`;
      console.log("Navigating to:", url);
      window.location.href = url;
    }
  };

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate ads
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % mainBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleAdClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const banner = mainBanners[currentBanner];
  const currentAd = ads[currentAdIndex];

  return (
    <section className="py-4 md:py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-5">
          {/* Main Banner Slider - Takes 2 columns - Now shows only ads */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden min-h-[380px] shadow-lg border border-white/50">
  {ads.length > 0 ? (
    <div className="relative w-full h-[380px]">
      
      {/* Ad Image Container */}
      <div
        className="relative w-full h-full cursor-pointer group flex items-center justify-center bg-gray-100 overflow-hidden"
        onClick={() => handleAdClick(currentAd?.url)}
      >
        {/* Blurred background image */}
        {currentAd?.image && (
          <div 
            className="absolute inset-0 w-full h-full z-0"
            style={{
              backgroundImage: `url(${currentAd.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
        )}
        
        {/* Main image on top */}
        {currentAd?.image && (
          <img
            src={currentAd.image}
            alt="Advertisement"
            className="relative z-10 max-w-full max-h-full object-contain rounded-3xl"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-3xl z-20">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaExternalLinkAlt className="text-white text-2xl" />
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      {ads.length > 1 && (
        <>
          <button
            onClick={prevAd}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <FaChevronLeft className="text-gray-700" />
          </button>
          <button
            onClick={nextAd}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <FaChevronRight className="text-gray-700" />
          </button>
        </>
      )}

      {/* Indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-6 flex gap-2 z-30">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAdIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentAdIndex ? "bg-white w-8" : "bg-white/50 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  ) : (
    // Fallback Banner
    <div className={`relative ${banner.bgColor} h-full p-6 md:p-8`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

      <button
        onClick={prevBanner}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
      >
        <FaChevronLeft className="text-gray-700" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
      >
        <FaChevronRight className="text-gray-700" />
      </button>

      <div className="relative z-10 h-full flex flex-col justify-center">
        <span className={`${banner.accentColor} text-xs font-bold uppercase tracking-widest mb-2`}>
          {t("promoBanner.featuredService", "Featured Service")}
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
          {banner.title}
        </h2>
        <p className="text-gray-700 text-sm md:text-base mb-1">{banner.subtitle}</p>
        <p className="text-gray-500 text-sm mb-6">{banner.tagline}</p>

        <button
          onClick={() => (window.location.href = "/services")}
          className={`${banner.buttonColor} text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-xl w-fit`}
        >
          {banner.buttonText}
          <FaArrowRight className="text-sm" />
        </button>
      </div>

      <div className="absolute bottom-4 left-6 flex gap-2">
        {mainBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentBanner(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentBanner ? "bg-gray-800 w-8" : "bg-gray-400/50 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  )}
</div>

          {/* Service Cards - Takes 3 columns (now shows all 3 cards) */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {promoCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(card)}
                  className={`bg-gradient-to-br ${card.bgColor} rounded-3xl p-5 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden min-h-[320px] shadow-lg group flex flex-col`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-white text-xl" />
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-1 tracking-wide">{card.title}</h3>
                  <p className="text-white/90 text-sm mb-2">{card.subtitle}</p>
                  <p className="text-white/70 text-xs leading-relaxed flex-grow">{card.description}</p>
                  
                  <div className="mt-4 flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">{t("promoBanner.explore", "Explore")}</span>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <FaChevronRight className="text-white text-xs" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Mobile Banner - Now shows ads or fallback with original size */}
          <div className="relative rounded-2xl overflow-hidden min-h-[200px] shadow-md">
            {ads.length > 0 ? (
              // Display ads in mobile banner with original styling
              <div className="relative w-full h-[200px]">
                {/* Ad Image */}
                <div 
                  className="relative w-full h-full cursor-pointer group overflow-hidden"
                  onClick={() => handleAdClick(currentAd?.url)}
                >
                  {/* Blurred background image */}
                  {currentAd?.image && (
                    <div 
                      className="absolute inset-0 w-full h-full z-0"
                      style={{
                        backgroundImage: `url(${currentAd.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(15px)',
                        transform: 'scale(1.1)'
                      }}
                    />
                  )}
                  
                  {/* Main image on top */}
                  {currentAd?.image && (
                    <img 
                      src={currentAd.image} 
                      alt="Advertisement" 
                      className="relative z-10 w-full h-full object-contain rounded-2xl"
                    />
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-2xl z-20">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaExternalLinkAlt className="text-white text-xl" />
                    </div>
                  </div>
                </div>

                {/* Navigation buttons for multiple ads */}
                {ads.length > 1 && (
                  <>
                    <button
                      onClick={prevAd}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                    >
                      <FaChevronLeft className="text-gray-700 text-xs" />
                    </button>
                    <button
                      onClick={nextAd}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                    >
                      <FaChevronRight className="text-gray-700 text-xs" />
                    </button>
                  </>
                )}

                {/* Indicators for multiple ads - same style as original */}
                {ads.length > 1 && (
                  <div className="absolute bottom-3 left-5 flex gap-1.5 z-30">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentAdIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentAdIndex ? "bg-white w-5" : "bg-white/50 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Fallback when no ads available - show original banner
              <div className={`relative ${banner.bgColor} h-full p-5`}>
                <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-xl"></div>
                
                <button
                  onClick={prevBanner}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <FaChevronLeft className="text-gray-700 text-xs" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <FaChevronRight className="text-gray-700 text-xs" />
                </button>

                <div className="relative z-10">
                  <span className={`${banner.accentColor} text-[10px] font-bold uppercase tracking-widest`}>
                    {t("promoBanner.featuredService", "Featured Service")}
                  </span>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight mt-1">
                    {banner.title}
                  </h2>
                  <p className="text-gray-600 text-xs mb-3">{banner.subtitle}</p>
                  <button 
                    onClick={() => window.location.href = "/services"}
                    className={`${banner.buttonColor} text-white px-4 py-2 rounded-lg font-semibold text-sm inline-flex items-center gap-2 shadow-md`}
                  >
                    {banner.buttonText}
                    <FaArrowRight className="text-xs" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-5 flex gap-1.5">
                  {mainBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentBanner ? "bg-gray-800 w-5" : "bg-gray-400/50 w-1.5"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Service Cards - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {promoCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(card)}
                  className={`bg-gradient-to-br ${card.bgColor} min-w-[160px] rounded-2xl p-4 cursor-pointer relative overflow-hidden shadow-md flex-shrink-0`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="text-white text-lg" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
                  <p className="text-white/80 text-xs mb-2">{card.subtitle}</p>
                  <p className="text-white/60 text-[10px] leading-relaxed">{card.description}</p>
                  
                  <div className="mt-3 flex items-center gap-1.5 text-white/80">
                    <span className="text-[10px] font-medium">{t("promoBanner.explore", "Explore")}</span>
                    <FaArrowRight className="text-[8px]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
