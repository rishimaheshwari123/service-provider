import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllCategoriesAPI } from "@/service/operations/category";
import {
  FaUtensils,
  FaHotel,
  FaSpa,
  FaHome,
  FaRing,
  FaGraduationCap,
  FaCar,
  FaHospital,
  FaHardHat,
  FaDog,
  FaBed,
  FaBuilding,
  FaTooth,
  FaDumbbell,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCarSide,
  FaTruck,
  FaShippingFast,
  FaThLarge,
} from "react-icons/fa";

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  restaurants: FaUtensils,
  hotels: FaHotel,
  "beauty spa": FaSpa,
  beauty: FaSpa,
  spa: FaSpa,
  "home decor": FaHome,
  wedding: FaRing,
  "wedding planning": FaRing,
  education: FaGraduationCap,
  "rent & hire": FaCar,
  hospitals: FaHospital,
  contractors: FaHardHat,
  "pet shops": FaDog,
  pets: FaDog,
  "pg/hostels": FaBed,
  hostel: FaBed,
  "estate agent": FaBuilding,
  "real estate": FaBuilding,
  dentists: FaTooth,
  dental: FaTooth,
  gym: FaDumbbell,
  fitness: FaDumbbell,
  loans: FaMoneyBillWave,
  finance: FaMoneyBillWave,
  "event organisers": FaCalendarAlt,
  events: FaCalendarAlt,
  "driving schools": FaCarSide,
  "packers & movers": FaTruck,
  movers: FaTruck,
  courier: FaShippingFast,
  "courier service": FaShippingFast,
};

const getIconForCategory = (categoryName: string) => {
  const lowerName = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return icon;
    }
  }
  return FaThLarge;
};

export default function CategoryGrid() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    window.location.href = `/services?category=${encodeURIComponent(categoryId)}`;
  };

  const handleViewAll = () => {
    window.location.href = "/categories";
  };

  // Only 16 categories - 2 rows of 8
  const topCategories = categories.slice(0, 16);
  const groupedCategories = [
    { title: t("common.popularServices"), items: categories.slice(0, 3) },
    { title: t("common.trendingNow"), items: categories.slice(3, 6) },
    { title: t("common.topRated"), items: categories.slice(6, 9) },
    { title: t("common.exploreMore"), items: categories.slice(9, 12) },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Icon Categories - 2 rows of 8 */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 mb-8">
          {topCategories.map((cat) => {
            const Icon = getIconForCategory(cat.name);
            return (
              <div
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className="cursor-pointer flex flex-col items-center group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-gray-200 rounded-lg flex items-center justify-center mb-2 group-hover:border-blue-600 group-hover:shadow-md transition-all duration-200 bg-white">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Icon className="text-2xl md:text-3xl text-gray-600 group-hover:text-blue-600" />
                  )}
                </div>
                <span className="text-xs text-center text-gray-700 leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleViewAll}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t("common.viewAllCategories")}
          </button>
        </div>

        {/* Grouped Categories with Images - JustDial Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupedCategories.map(
            (group, idx) =>
              group.items.length > 0 && (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {group.items.map((cat) => (
                      <div
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat._id)}
                        className="cursor-pointer group"
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-gray-200">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              {(() => {
                                const Icon = getIconForCategory(cat.name);
                                return (
                                  <Icon className="text-4xl text-gray-400" />
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-center text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {cat.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
}
