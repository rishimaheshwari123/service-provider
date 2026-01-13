import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";

export default function PromoBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentBanner, setCurrentBanner] = useState(0);

  const mainBanners = [
    {
      title: t("pages.home.getLoanAgainstProperty"),
      subtitle: t("pages.home.atCompetitiveInterestRate"),
      highlight: t("pages.home.startingFrom"),
      company: t("pages.home.fromJioFinance"),
      buttonText: t("common.applyNow"),
      bgColor: "bg-gradient-to-r from-orange-50 to-orange-100",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop",
    },
    {
      title: t("pages.home.homeServicesAtDoorstep"),
      subtitle: t("pages.home.professionalVerified"),
      highlight: t("pages.home.startingPrice"),
      company: t("pages.home.trustedByCustomers"),
      buttonText: t("common.bookNow"),
      bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=400&fit=crop",
    },
  ];

  const promoCards = [
    {
      title: t("pages.home.b2b"),
      subtitle: t("common.quickQuotes"),
      bgColor: "bg-blue-600",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=250&fit=crop",
      link: "/services",
    },
    {
      title: t("pages.home.repairsServices"),
      subtitle: t("common.getNearestVendor"),
      bgColor: "bg-yellow-600",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=250&fit=crop",
      link: "/services",
    },
    {
      title: t("pages.home.realEstate"),
      subtitle: t("common.finestAgents"),
      bgColor: "bg-teal-600",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=250&fit=crop",
      link: "/services",
    },
    {
      title: t("pages.home.doctors"),
      subtitle: t("common.bookNow"),
      bgColor: "bg-green-600",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=250&fit=crop",
      link: "/services",
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
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-hidden">
          {/* Main Banner Slider */}
          <div className={`relative flex-1 min-w-0 ${banner.bgColor} rounded-2xl p-6 flex items-center justify-between overflow-hidden`}>
            {/* Left Arrow */}
            <button
              onClick={prevBanner}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <FaChevronLeft className="text-gray-600 text-sm" />
            </button>

            {/* Content */}
            <div className="flex-1 pr-4 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                {banner.title}
              </h2>
              <p className="text-gray-600 text-sm mb-1">{banner.subtitle}</p>
              <p className="text-orange-600 font-bold text-lg mb-1">{banner.highlight}</p>
              <p className="text-gray-500 text-sm mb-4">{banner.company}</p>
              <button className={`${banner.buttonColor} text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors`}>
                {banner.buttonText}
                <FaArrowRight className="text-sm" />
              </button>
            </div>

            {/* Image */}
            <div className="hidden sm:block w-40 md:w-48 h-48 md:h-56 flex-shrink-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-top rounded-lg"
              />
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextBanner}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <FaChevronRight className="text-gray-600 text-sm" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {mainBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentBanner ? "bg-orange-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Promo Cards */}
          <div className="hidden lg:flex gap-3 flex-shrink-0">
            {promoCards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => navigate(card.link)}
                className={`${card.bgColor} w-36 rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden`}
              >
                <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
                <p className="text-white/80 text-xs mb-8">{card.subtitle}</p>
                
                {/* Arrow */}
                <div className="absolute bottom-16 left-4 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <FaChevronRight className="text-white text-xs" />
                </div>

                {/* Image */}
                <div className="absolute bottom-0 right-0 w-24 h-24">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-top rounded-tl-2xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Promo Cards */}
        <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {promoCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              className={`${card.bgColor} min-w-[140px] rounded-xl p-3 cursor-pointer relative overflow-hidden`}
            >
              <h3 className="text-white font-bold text-xs mb-1">{card.title}</h3>
              <p className="text-white/80 text-[10px]">{card.subtitle}</p>
              <div className="absolute bottom-0 right-0 w-16 h-16">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-top rounded-tl-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
