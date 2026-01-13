import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Phone,
  MapPin,
  Star,
  Clock,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  X,
} from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import { getAllCategoriesAPI } from "@/service/operations/category";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MAX_PRICE_LIMIT = 50000;
const MIN_PRICE_LIMIT = 0;

const ServicesPage = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
    location: "",
    category: "all",
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const minPrice = Number(params.get("minPrice")) || MIN_PRICE_LIMIT;
    const maxPrice = Number(params.get("maxPrice")) || MAX_PRICE_LIMIT;

    const newFilters = {
      title: params.get("title") || "",
      price: [minPrice, maxPrice],
      location: params.get("location") || "",
      category: params.get("category") || "all",
    };
    setFilters(newFilters);
  }, [location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const allServices = await getAllPropertyAPI();
      setServices(allServices);
      setFilteredServices(allServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) applyFilters(filters);
  }, [services, filters]);

  const applyFilters = (newFilters) => {
    const [minPrice, maxPrice] = newFilters.price;

    const filtered = services.filter((service) => {
      const matchTitle = service.title
        ?.toLowerCase()
        .includes(newFilters.title.toLowerCase());
      const matchLocation = service.location
        ?.toLowerCase()
        .includes(newFilters.location.toLowerCase());
      const matchCategory =
        newFilters.category === "all" ||
        service.category?.toLowerCase() === newFilters.category.toLowerCase();

      const servicePrice = Number(service.price);
      const matchPrice = servicePrice >= minPrice && servicePrice <= maxPrice;

      return matchTitle && matchLocation && matchCategory && matchPrice;
    });

    setFilteredServices(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleCategoryChange = (value) => {
    const newFilters = { ...filters, category: value };
    setFilters(newFilters);
  };

  const handleHireNow = (id) => {
    navigate(`/service/${id}`);
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Number((total / reviews.length).toFixed(1));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    if (rating >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  const clearFilters = () => {
    setFilters({
      title: "",
      price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
      location: "",
      category: "all",
    });
  };

  return (
    <>
      <Navbar />
      <section className="bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="title"
                    value={filters.title}
                    onChange={handleInputChange}
                    placeholder={t("common.search") + "..."}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleInputChange}
                    placeholder={t("filter.locationPlaceholder")}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Category & Filter Button */}
              <div className="flex gap-2">
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white min-w-[160px]"
                >
                  <option value="all">{t("pages.home.allCategories")}</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("common.filter")}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {(filters.title || filters.location || filters.category !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Price:</span>
                  <input
                    type="number"
                    value={filters.price[0]}
                    onChange={(e) => setFilters({ ...filters, price: [Number(e.target.value), filters.price[1]] })}
                    className="w-24 px-2 py-1 border rounded text-sm"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={filters.price[1]}
                    onChange={(e) => setFilters({ ...filters, price: [filters.price[0], Number(e.target.value)] })}
                    className="w-24 px-2 py-1 border rounded text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredServices.length}</span> {t("nav.services")} {filters.category !== "all" && `in "${filters.category}"`}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service, index) => {
                const avgRating = getAverageRating(service.review);
                const reviewCount = service.review?.length || 0;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-72 h-48 md:h-auto relative flex-shrink-0">
                        <img
                          src={service.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                        {service.featured && (
                          <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1">
                            {/* Title & Verified */}
                            <div className="flex items-start gap-2 mb-2">
                              <h3
                                onClick={() => handleHireNow(service._id)}
                                className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {service.title}
                              </h3>
                              {service.verified && (
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                              )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-3">
                              {avgRating > 0 ? (
                                <>
                                  <span className={`${getRatingColor(avgRating)} text-white text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1`}>
                                    {avgRating} <Star className="w-3 h-3 fill-white" />
                                  </span>
                                  <span className="text-gray-600 text-sm">
                                    {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400 text-sm">{t("pages.home.noRatings")}</span>
                              )}
                              {service.category && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {service.category}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {service.description || "Professional service provider offering quality services."}
                            </p>

                            {/* Location & Timing */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              {service.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{service.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Open Now</span>
                              </div>
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:pl-5">
                            {service.price && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">{t("pages.home.startsFrom")}</p>
                                <p className="text-xl font-bold text-gray-900">₹{service.price?.toLocaleString()}</p>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleHireNow(service._id)}
                                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                {t("common.viewDetails")}
                              </button>
                              <a
                                href={`tel:${service.phone || "+917879884363"}`}
                                className="p-2.5 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                              >
                                <Phone className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ServicesPage;
