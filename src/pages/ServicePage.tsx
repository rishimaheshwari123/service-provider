import { useEffect, useState, useCallback, useMemo } from "react";
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
  MessageSquare,
  Calendar,
} from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { getAllReatingAPI, addRating } from "@/service/operations/rating";
import { matchesSearchTerm, sortByRelevance, highlightSearchTerm } from "@/utils/searchUtils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewModal from "@/components/ReviewModal";
import ReviewsList from "@/components/ReviewsList";

const MAX_PRICE_LIMIT = 50000;
const MIN_PRICE_LIMIT = 0;

const ServicesPage = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    serviceId: string;
    serviceName: string;
  }>({
    isOpen: false,
    serviceId: "",
    serviceName: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
    category: "all",
    autoFilled: "", // Add autoFilled filter
  });

  // TEMPORARY FLAG: Set to false when real reviews are available
  const USE_MOCK_REVIEWS = false;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("=== PARSING URL PARAMETERS ===");
    const params = new URLSearchParams(location.search);
    console.log("URL search params:", location.search);
    const minPrice = Number(params.get("minPrice")) || MIN_PRICE_LIMIT;
    const maxPrice = Number(params.get("maxPrice")) || MAX_PRICE_LIMIT;

    const newFilters = {
      search: params.get("search") || params.get("title") || params.get("location") || "",
      price: [minPrice, maxPrice],
      category: params.get("category") || "all",
      autoFilled: params.get("autoFilled") || "", // Add autoFilled parameter
    };
    console.log("Parsed filters:", newFilters);
    setFilters(newFilters);
  }, [location.search]);

  useEffect(() => {
    const initializeData = async () => {
      if (dataInitialized) return; // Prevent multiple initializations
      
      try {
        console.log("=== INITIALIZING DATA ===");
        setDataInitialized(true);
        
        // First fetch categories and reviews
        const [categoriesData, reviewsData] = await Promise.all([
          getAllCategoriesAPI(),
          getAllReatingAPI()
        ]);
        
        console.log("Categories fetched:", categoriesData?.length || 0);
        console.log("Sample categories:", categoriesData?.slice(0, 5).map(cat => ({
          name: cat.name,
          autoFilled: cat.autoFilled
        })));
        
        setCategories(categoriesData || []);
        setAllReviews(reviewsData || []);
        
        console.log("Fetched reviews:", reviewsData);
        console.log("Total reviews count:", reviewsData?.length || 0);
        
        // Then fetch services only once
        await fetchServices();
      } catch (error) {
        console.error("Error initializing data:", error);
        setDataInitialized(false); // Reset on error
      }
    };
    
    initializeData();
  }, []); // Remove dependencies to prevent re-runs

  const fetchServices = useCallback(async (categoryFilter = null) => {
    try {
      console.log("=== FETCHING SERVICES ===");
      console.log("Category filter:", categoryFilter);
      setLoading(true);
      const filterParams: any = {};
      if (categoryFilter && categoryFilter !== 'all') {
        filterParams.category = categoryFilter;
      }
      const allServices = await getAllPropertyAPI(filterParams);
      console.log("Fetched services:", allServices?.length || 0);
      console.log("Services count:", allServices?.length || 0);
      
      // Log first service to see its structure
      if (allServices && allServices.length > 0) {
        console.log("First service structure:", {
          id: allServices[0]._id,
          title: allServices[0].title,
          category: allServices[0].category,
          vendor: allServices[0].vendor?.name
        });
        console.log("Sample services categories:", allServices.slice(0, 5).map(s => s.category));
      }
      
      setServices(allServices || []);
      setFilteredServices(allServices || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the applyFilters function to prevent unnecessary re-renders
  const applyFilters = useCallback((newFilters) => {
    const [minPrice, maxPrice] = newFilters.price;
    const searchTerm = newFilters.search?.toLowerCase().trim() || "";

    console.log("=== APPLY FILTERS DEBUG ===");
    console.log("Categories available:", categories.length);
    console.log("Services available:", services.length);
    console.log("AutoFilled filter:", newFilters.autoFilled);

    let filtered = services.filter((service) => {
      // Use the utility function for consistent search logic
      const matchSearch = matchesSearchTerm(service, searchTerm);

      // Category matching - check both category name and autoFilled
      let matchCategory = true;
      if (newFilters.category !== "all") {
        matchCategory = (service as any).category?.toLowerCase() === newFilters.category.toLowerCase();
      }
      
      // AutoFilled matching - filter by autoFilled field from categories
      let matchAutoFilled = true;
      if (newFilters.autoFilled) {
        // Handle multiple autoFilled values separated by comma
        const autoFilledValues = newFilters.autoFilled.split(',').map(v => v.trim().toLowerCase());
        console.log("Looking for autoFilled values:", autoFilledValues);
        
        // Get all categories that match any of the autoFilled values
        const matchingCategories = categories.filter(cat => 
          cat.autoFilled && autoFilledValues.some(value => 
            cat.autoFilled.toLowerCase() === value
          )
        );
        
        console.log("Found matching categories:", matchingCategories.length);
        console.log("Matching category names:", matchingCategories.map(cat => `${cat.name} (${cat.autoFilled})`));
        
        // Get all category names that match
        const matchingCategoryNames = matchingCategories.map(cat => cat.name.toLowerCase());
        
        // Check if this service's category is in the matching categories
        if (matchingCategoryNames.length > 0) {
          matchAutoFilled = matchingCategoryNames.includes((service as any).category?.toLowerCase());
        } else {
          matchAutoFilled = false;
        }
      }

      // Handle price filtering - skip if price is "NA" or not a valid number
      const servicePrice = Number((service as any).price);
      const matchPrice = 
        (service as any).price === "NA" || 
        (service as any).price === "N/A" || 
        isNaN(servicePrice) || 
        (servicePrice >= minPrice && servicePrice <= maxPrice);

      return matchSearch && matchCategory && matchAutoFilled && matchPrice;
    });

    // Sort by relevance if there's a search term
    if (searchTerm) {
      filtered = sortByRelevance(filtered, searchTerm);
    }

    console.log("Final filtered services:", filtered.length);
    console.log("=== END FILTER DEBUG ===");
    setFilteredServices(filtered);
  }, [services, categories]);

  // Apply filters when services, categories, or filters change
  useEffect(() => {
    if (services.length > 0 && categories.length > 0 && dataInitialized) {
      console.log("Applying filters with categories loaded:", categories.length);
      applyFilters(filters);
    }
  }, [services, categories, filters, dataInitialized, applyFilters]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setFilters(prevFilters => ({ ...prevFilters, category: value }));
  }, []);

  const handleHireNow = useCallback((id) => {
    navigate(`/service/${id}`);
  }, [navigate]);

  const handleAddReview = useCallback((serviceId: string, serviceName: string) => {
    setReviewModal({
      isOpen: true,
      serviceId,
      serviceName,
    });
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewModal({
      isOpen: false,
      serviceId: "",
      serviceName: "",
    });
  }, []);

  const handleReviewAdded = useCallback(async () => {
    // Refresh reviews after adding a new one
    try {
      const freshReviews = await getAllReatingAPI();
      setAllReviews(freshReviews || []);
      toast.success("Review added successfully!");
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  }, []);

  const getAverageRating = useCallback((serviceId: string) => {
    // First try to get reviews from the populated review field
    const service = services.find((s: any) => s._id === serviceId);
    if (service?.review && Array.isArray(service.review) && service.review.length > 0) {
      const total = service.review.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      return Number((total / service.review.length).toFixed(1));
    }
    
    // Fallback: get reviews from separate API call
    const serviceReviews = allReviews.filter((review: any) => review.property === serviceId);
    if (serviceReviews.length === 0) {
      return 0;
    }
    const total = serviceReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    return Number((total / serviceReviews.length).toFixed(1));
  }, [services, allReviews]);

  const getReviewCount = useCallback((serviceId: string) => {
    // First try to get count from the populated review field
    const service = services.find((s: any) => s._id === serviceId);
    if (service?.review && Array.isArray(service.review)) {
      if (service.review.length > 0) {
        return service.review.length;
      }
    }
    
    // Fallback: get count from separate API call
    const serviceReviews = allReviews.filter((review: any) => review.property === serviceId);
    const count = serviceReviews.length;
    
    // Log only when reviews are found
    if (count > 0) {
      console.log(`Service ${serviceId} has ${count} reviews`);
    }
    
    return count;
  }, [services, allReviews]);
const toPascalCase = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

  const getRatingColor = useCallback((rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    if (rating >= 2) return "bg-orange-500";
    return "bg-red-500";
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
      category: "all",
      autoFilled: "",
    });
  }, []);

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
                    name="search"
                    value={filters.search}
                    onChange={handleInputChange}
                    placeholder={toPascalCase("Search By Vendor Name, Service, Location, City, Pincode...")}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Trigger search on Enter key
                        applyFilters(filters);
                      }
                      if (e.key === "Escape") {
                        // Clear search on Escape key
                        setFilters({ ...filters, search: "" });
                      }
                    }}
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters({ ...filters, search: "" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category & Filter Button */}
              <div className="flex gap-2">
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white min-w-[160px]"
                >
                  <option value="all">{toPascalCase(t("pages.home.allCategories"))}</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {toPascalCase(cat.name)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{toPascalCase(t("common.filter"))}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {(filters.search || filters.category !== "all" || filters.autoFilled) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">{toPascalCase("Clear")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{toPascalCase("Price")}:</span>
                  <input
                    type="number"
                    value={filters.price[0]}
                    onChange={(e) => setFilters({ ...filters, price: [Number(e.target.value), filters.price[1]] })}
                    className="w-24 px-2 py-1 border rounded text-sm"
                    placeholder={toPascalCase("Min")}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={filters.price[1]}
                    onChange={(e) => setFilters({ ...filters, price: [filters.price[0], Number(e.target.value)] })}
                    className="w-24 px-2 py-1 border rounded text-sm"
                    placeholder={toPascalCase("Max")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? (
                toPascalCase("Searching...")
              ) : (
                <>
                  {toPascalCase("Showing")} {filteredServices.length} {toPascalCase("Of")} {services.length} {toPascalCase("Services")}
                  {filters.search && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {toPascalCase("For")} "{filters.search}"
                    </span>
                  )}
                  {filters.category !== "all" && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {toPascalCase("In")} {toPascalCase(filters.category)}
                    </span>
                  )}
                  {filters.autoFilled && (
                    <span className="ml-2 text-green-600 font-medium">
                      ({filters.autoFilled.split(',').map(item => toPascalCase(item.trim())).join(' & ')} {toPascalCase("Services")})
                    </span>
                  )}
                </>
              )}
            </p>
            {filteredServices.length > 0 && (
              <p className="text-sm text-gray-500">
                {toPascalCase("Results Sorted By Relevance")}
              </p>
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20 max-w-4xl mx-auto">
              {/* Icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-blue-600" />
              </div>
              
              {/* English Section */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Service Coming Soon in Your Area 🚀
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  This service is not available at the moment — but we're expanding fast!
                </p>
                
                {/* Service Provider CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 mb-4 flex items-start justify-center gap-2">
                    <span className="text-2xl">👨‍🔧</span>
                    <span className="text-left">
                      <strong>Are you a service provider?</strong><br />
                      Register now on our app and start receiving customer leads.
                    </span>
                  </p>
                  <button
                    onClick={() => navigate("/vendor/register")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    Register Now
                  </button>
                </div>
                
                {/* Customer Interest */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <p className="text-gray-700 mb-4 flex items-start justify-center gap-2">
                    <span className="text-2xl">📩</span>
                    <span className="text-left">
                      <strong>Want this service in your area?</strong><br />
                      Leave your contact details, and we'll notify you when it's live.
                    </span>
                  </p>
                  <button
                    onClick={() => navigate("/contact")}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    Notify Me
                  </button>
                </div>
              </div>
              
              {/* Hindi Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  सेवा उपलब्ध नहीं है 😔
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  क्षमा करें! यह सेवा फिलहाल आपके क्षेत्र में उपलब्ध नहीं है।
                </p>
                <p className="text-gray-600 mb-6">
                  हम लगातार नए सेवा प्रदाताओं को जोड़ रहे हैं और जल्द ही यह सेवा आपके क्षेत्र में उपलब्ध होगी।
                </p>
                
                {/* Service Provider CTA - Hindi */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <p className="text-gray-700 mb-4">
                    <span className="text-2xl">👉</span>{" "}
                    यदि आप किसी भी प्रकार की सेवा प्रदान करते हैं, तो कृपया हमारे ऐप पर रजिस्टर करें और अपने व्यवसाय को बढ़ाएं।
                  </p>
                  <button
                    onClick={() => navigate("/vendor/register")}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    सेवा प्रदाता के रूप में रजिस्टर करें
                  </button>
                </div>
              </div>
              
              {/* Search Suggestions (if search was used) */}
              {filters.search && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">{toPascalCase("Suggestions")}:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, search: "plumber" })}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Plumber")}
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, search: "electrician" })}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Electrician")}
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, search: "cleaning" })}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Cleaning")}
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, search: "repair" })}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Repair")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service: any, index) => {
                const avgRating = getAverageRating(service._id);
                const reviewCount = getReviewCount(service._id);

                return (
                  <div
                    key={service._id || index}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-72 h-48 md:h-[50vh] relative flex-shrink-0">
                        <img
                          src={service.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                        {service.featured && (
                          <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            {toPascalCase("Featured")}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1">
                            {/* Vendor Information - Now at the top */}
                            {service.vendor && (
                              <div className="flex items-start gap-2 mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {service.vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  {service.vendor.company && (
                                    <p className="text-sm font-bold text-gray-600 truncate">
  {filters.search
    ? highlightSearchTerm(
        toPascalCase(service.vendor.company),
        filters.search
      )
    : toPascalCase(service.vendor.company)}
</p>

                                  )}
                                 <p className="text-[12px] text-gray-900 truncate">
  {filters.search
    ? highlightSearchTerm(
        toPascalCase(service.vendor.name || "Vendor Name"),
        filters.search
      )
    : toPascalCase(service.vendor.name || "Vendor Name")}
</p>

                                  
                                {service.vendor.address && (
  <p className="text-xs text-gray-500 line-clamp-1 mt-1">
    <MapPin className="w-3 h-3 inline mr-1" />
    {filters.search
      ? highlightSearchTerm(
          toPascalCase(service.vendor.address),
          filters.search
        )
      : toPascalCase(service.vendor.address)}
  </p>
)}

                                </div>
                                {service.verified && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                            )}

                            {/* Service Title - Now below vendor */}
                            <div className="mb-2">
  <h3
    onClick={() => handleHireNow(service._id)}
    className="text-base md:text-lg font-semibold text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
  >
    {filters.search
      ? highlightSearchTerm(
          toPascalCase(service.title),
          filters.search
        )
      : toPascalCase(service.title)}
  </h3>
</div>


                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-3">
                              {avgRating > 0 ? (
                                <>
                                  <span className={`${getRatingColor(avgRating)} text-white text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1`}>
                                    {avgRating} <Star className="w-3 h-3 fill-white" />
                                  </span>
                                  <span className="text-gray-600 text-sm">
                                    {reviewCount} {reviewCount === 1 ? toPascalCase("Review") : toPascalCase("Reviews")}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {toPascalCase("No Reviews Yet")}
                                </span>
                              )}
                              {service.category && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {toPascalCase(service.category)}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3">
                              {toPascalCase(service.description) || "Professional Service Provider Offering Quality Services."}
                            </p>

                            {/* Location & Timing */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              {service.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {filters.search ? 
                                      highlightSearchTerm(toPascalCase(service.location), filters.search) :
                                      toPascalCase(service.location)
                                    }
                                  </span>
                                </div>
                              )}
                             
                            </div>
                            <div className="bg-white rounded-lg mt- shadow-sm mt-2">
                <h2 className="text-lg font-bold text-gray-900  flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> {toPascalCase("Working Hours")}
                </h2>
                <div className="bg-gray-50 rounded-lg  px-2">
                  <p className="text-gray-700 font-medium">
                    {toPascalCase(service.vendor?.workingDaysTimings) || "Monday - Saturday: 9:00 AM - 6:00 PM"}
                  </p>
                </div>
              </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:pl-5">
                            {/* {service.price && service.price !== "NA" && service.price !== "N/A" && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">{t("pages.home.startsFrom")}</p>
                                <p className="text-xl font-bold text-gray-900">₹{isNaN(Number(service.price)) ? service.price : Number(service.price).toLocaleString()}</p>
                              </div>
                            )} */}
                           <div className="text-right">
                                                                <p className="text-xl font-bold text-gray-900">{toPascalCase("Contact For Price")}</p>

                                {/* <p className="text-xs text-gray-500">Price</p> */}
                              </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleHireNow(service._id)}
                                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                {t("common.viewDetails")}
                              </button>
                              <button
                                onClick={() => handleAddReview(service._id, service.title)}
                                className="px-4 py-2.5 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {toPascalCase("Add Review")}
                              </button>
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
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleCloseReviewModal}
        serviceId={reviewModal.serviceId}
        serviceName={toPascalCase(reviewModal.serviceName)}
        onReviewAdded={handleReviewAdded}
      />
      
      <Footer />
    </>
  );
};

export default ServicesPage;
