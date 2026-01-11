import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { FaBicycle, FaWrench, FaToilet, FaTools } from "react-icons/fa";

const icons = [FaBicycle, FaWrench, FaToilet, FaTools];

export default function CategoryGrid() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  const handleViewAll = () => {
    navigate("/services");
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          {t("pages.home.exploreCategories")}
        </h2>

        {/* Category Grid (Only 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat, index) => {
            const Icon = icons[index % icons.length];

            return (
              <div
                key={cat._id}
                onClick={() => handleCategoryClick(cat.name)}
                className="cursor-pointer bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white">
                  <Icon className="text-2xl" />
                </div>

                <h3 className="text-lg font-semibold text-gray-700">
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleViewAll}
            className="px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
}
