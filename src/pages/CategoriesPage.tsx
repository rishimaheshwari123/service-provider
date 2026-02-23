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

interface GroupedData {
  autoFilledGroups: {
    title: string;
    categories: Category[];
  }[];
  ungroupedCategories: Category[];
}

const CategoriesPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData>({ autoFilledGroups: [], ungroupedCategories: [] });
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiCalled, setApiCalled] = useState(false); // Prevent duplicate calls
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 CategoriesPage useEffect triggered, apiCalled:", apiCalled);
    if (!apiCalled) {
      setApiCalled(true);
      fetchCategories();
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Filter categories based on search term
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.autoFilled?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      console.log("📡 Fetching categories from API...");
      setLoading(true);
      const response = await getAllCategoriesAPI();
      console.log("Categories API Response:", response);
      
      // Handle both old and new API response formats
      if (response?.groupedData) {
        // New format with grouped data - use directly
        console.log("✅ Using new grouped data format");
        setCategories(response.categories || []);
        setGroupedData(response.groupedData);
        setFilteredCategories(response.categories || []);
      } else {
        // Old format - fallback with proper normalization
        console.log("⚠️ Using old format, applying client-side grouping");
        const data = response || [];
        setCategories(data);
        setFilteredCategories(data);
        
        // Helper function to normalize autoFilled values (same as backend)
        const normalizeAutoFilled = (autoFilled: string) => {
          if (!autoFilled || autoFilled.trim() === '') return null;
          
          let normalized = autoFilled.toLowerCase().trim().replace(/\s+/g, ' ');
          
          const normalizations: Record<string, string> = {
            'home service': 'home services',
            'home services': 'home services',
            'homeservice': 'home services',
            'homeservices': 'home services',
            'repairing': 'repairing',
            'repair': 'repairing',
            'repairs': 'repairing',
            'transport': 'transport',
            'transportation': 'transport',
            'tranport': 'transport',
            'event management': 'event management',
            'event managment': 'event management',
            'event': 'event management',
            'construction': 'construction',
            'shop': 'shop',
            'shops': 'shop',
            'food': 'food',
            'foods': 'food',
            'education': 'education',
            'educational': 'education',
            'health care': 'health care',
            'healthcare': 'health care',
            'health': 'health care',
            'medical': 'health care',
            'legal': 'legal',
            'astro': 'astro',
            'astrology': 'astro',
            'sports': 'sports',
            'sport': 'sports',
            'office/ school work': 'office work',
            'office/school work': 'office work',
            'office work': 'office work',
            'school work': 'office work',
            'car/bike': 'car bike',
            'car/ bike': 'car bike',
            'car bike': 'car bike',
            'decoration': 'decoration'
          };
          
          return normalizations[normalized] || normalized;
        };
        
        const toDisplayFormat = (text: string) => {
          return text
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };
        
        // Create grouped data with proper normalization
        const grouped = data.reduce((groups: Record<string, Category[]>, cat: Category) => {
          const normalizedKey = normalizeAutoFilled(cat.autoFilled);
          if (normalizedKey) {
            if (!groups[normalizedKey]) groups[normalizedKey] = [];
            groups[normalizedKey].push(cat);
          }
          return groups;
        }, {});
        
        const autoFilledGroups = Object.keys(grouped)
          .sort()
          .map(normalizedKey => ({
            title: toDisplayFormat(normalizedKey),
            categories: grouped[normalizedKey].sort((a, b) => a.name.localeCompare(b.name))
          }));
        
        const ungroupedCategories = data.filter((cat: Category) => 
          !normalizeAutoFilled(cat.autoFilled)
        );
        
        setGroupedData({ autoFilledGroups, ungroupedCategories });
      }
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

        {/* Categories Section */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {searchTerm.trim() !== "" ? (
              // Show filtered results when searching
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Search Results ({filteredCategories.length})
                </h2>
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {filteredCategories.map((cat) => {
                      const Icon = getIconForCategory(cat.name);
                      return (
                        <div
                          key={cat._id}
                          onClick={() => handleCategoryClick(cat.name)}
                          className="cursor-pointer flex flex-col items-center group"
                        >
                          <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-blue-200 rounded-lg flex items-center justify-center mb-2 group-hover:border-blue-600 group-hover:shadow-md transition-all duration-200 bg-blue-50">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <Icon className="text-2xl md:text-3xl text-blue-600 group-hover:text-blue-700" />
                            )}
                          </div>
                          <span className="text-xs text-center text-gray-700 leading-tight line-clamp-1">
                            {cat.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No categories found
                    </h3>
                    <p className="text-gray-600">
                      Try searching with different keywords
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Show grouped categories when not searching
              <div>
                {/* Auto-filled Services Grouped by Service Type */}
                {groupedData.autoFilledGroups.length > 0 && (
                  <div>
                    {groupedData.autoFilledGroups.map((group) => (
                      <div key={group.title} className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 ">
                          {group.title}
                        </h2>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                          {group.categories.map((cat) => {
                            const Icon = getIconForCategory(cat.name);
                            return (
                              <div
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="cursor-pointer flex flex-col items-center group"
                              >
                                <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-blue-200 rounded-lg flex items-center justify-center mb-2 group-hover:border-blue-600 group-hover:shadow-md transition-all duration-200 bg-blue-50">
                                  {cat.image ? (
                                    <img
                                      src={cat.image}
                                      alt={cat.name}
                                      className="w-10 h-10 object-contain"
                                    />
                                  ) : (
                                    <Icon className="text-2xl md:text-3xl text-blue-600 group-hover:text-blue-700" />
                                  )}
                                </div>
                                <span className="text-xs text-center text-gray-700 leading-tight line-clamp-1">
                                  {cat.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ungrouped Categories */}
                {groupedData.ungroupedCategories.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Other Services
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                      {groupedData.ungroupedCategories.map((cat) => {
                        const Icon = getIconForCategory(cat.name);
                        return (
                          <div
                            key={cat._id}
                            onClick={() => handleCategoryClick(cat.name)}
                            className="cursor-pointer flex flex-col items-center group"
                          >
                            <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-blue-200 rounded-lg flex items-center justify-center mb-2 group-hover:border-blue-600 group-hover:shadow-md transition-all duration-200 bg-blue-50">
                              {cat.image ? (
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="w-10 h-10 object-contain"
                                />
                              ) : (
                                <Icon className="text-2xl md:text-3xl text-blue-600 group-hover:text-blue-700" />
                              )}
                            </div>
                            <span className="text-xs text-center text-gray-700 leading-tight line-clamp-1">
                              {cat.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show message if no categories at all */}
                {groupedData.autoFilledGroups.length === 0 && groupedData.ungroupedCategories.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <CloudCog className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No categories available
                    </h3>
                    <p className="text-gray-600">
                      Categories will appear here once they are added
                    </p>
                  </div>
                )}
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