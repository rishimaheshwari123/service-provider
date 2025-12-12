import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { FaBicycle, FaWrench, FaToilet, FaTools } from "react-icons/fa"; // 4 fixed icons

const icons = [FaBicycle, FaWrench, FaToilet, FaTools]; // Fixed 4 icons

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleClick = (categoryName) => {
    // Navigate to service page with category query
    window.location.href = `http://localhost:8080/services?category=${encodeURIComponent(
      categoryName
    )}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Explore our categories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto gap-6">
        {categories.map((cat, index) => {
          const Icon = icons[index % icons.length]; // Cycle through 4 fixed icons
          return (
            <div
              key={cat._id}
              onClick={() => handleClick(cat.name)}
              className="cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 text-white"
            >
              <div className="p-4 bg-white rounded-full mb-4 text-pink-500 shadow-md">
                <Icon className="text-4xl" />
              </div>
              <h3 className="font-bold text-xl mb-1 text-center">{cat.name}</h3>
              <p className="text-white/90 text-sm text-center">₹{cat.price}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
