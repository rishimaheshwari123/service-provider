import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaBroom, FaTools, FaSpa } from "react-icons/fa";

export default function PromoBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentBanner, setCurrentBanner] = useState(0);

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
      title: t("promoBanner.cards.cleaning.title", "CLEANING"),
      subtitle: t("promoBanner.cards.cleaning.subtitle", "Home & Office Cleaning"),
      description: t("promoBanner.cards.cleaning.description", "Professional cleaning by trained experts"),
      icon: FaBroom,
      bgColor: "from-blue-600 via-blue-500 to-cyan-500",
      link: "/services?category=Cleaning",
    },
    {
      title: t("promoBanner.cards.repairing.title", "REPAIRING"),
      subtitle: t("promoBanner.cards.repairing.subtitle", "All Repair Solutions"),
      description: t("promoBanner.cards.repairing.description", "Expert technicians for all repairs"),
      icon: FaTools,
      bgColor: "from-orange-600 via-orange-500 to-amber-500",
      link: "/services?category=Repairing",
    },
    {
      title: t("promoBanner.cards.yoga.title", "YOGA"),
      subtitle: t("promoBanner.cards.yoga.subtitle", "Personal Yoga Training"),
      description: t("promoBanner.cards.yoga.description", "Certified trainers for wellness"),
      icon: FaSpa,
      bgColor: "from-emerald-600 via-green-500 to-teal-500",
      link: "/services?category=Yoga",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % mainBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);
  };

  const banner = mainBanners[currentBanner];

  return (
    <section className="py-4 md:py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-5">
          {/* Main Banner Slider - Takes 2 columns */}
          <div className={`lg:col-span-2 relative ${banner.bgColor} rounded-3xl p-6 md:p-8 overflow-hidden min-h-[320px] shadow-lg border border-white/50`}>
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
                onClick={() => navigate("/services")}
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

          {/* Service Cards - Takes 3 columns */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {promoCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(card.link)}
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
          {/* Mobile Banner */}
          <div className={`relative ${banner.bgColor} rounded-2xl p-5 overflow-hidden min-h-[200px] shadow-md`}>
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
                onClick={() => navigate("/services")}
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

          {/* Mobile Service Cards - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {promoCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(card.link)}
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
