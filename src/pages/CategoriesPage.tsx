import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, CloudCog } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

// Icon mapping for categories (same as homepage)
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

interface Category {
  _id: string;
  name: string;
  price: number;
  autoFilled: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const CategoriesPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories based on search term
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.autoFilled?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategoriesAPI();
      // console.log(data)
      setCategories(data || []);
      setFilteredCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button and Search */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                All Categories ({filteredCategories.length})
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories Section - Only Icon Grid */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "No categories available at the moment"}
                </p>
              </div>
            ) : (
              /* Show All Categories in Icon Grid Format */
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {filteredCategories.map((cat) => {
                  const Icon = getIconForCategory(cat.name);
                  return (
                    <div
                      key={cat._id}
                      onClick={() => handleCategoryClick(cat.name)}
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
                      <span className="text-xs text-center text-gray-700 leading-tight line-clamp-1">
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default CategoriesPage;