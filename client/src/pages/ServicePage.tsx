import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { getAllReatingAPI, addRating } from "@/service/operations/rating";
import { highlightSearchTerm } from "@/utils/searchUtils";
import { logSearch } from "@/utils/searchLogger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewModal from "@/components/ReviewModal";
import ReviewsList from "@/components/ReviewsList";
import SEO from "@/components/common/SEO";
import StructuredData, { generateBreadcrumbSchema } from "@/components/common/StructuredData";
import { seoConfig } from "@/utils/seoConfig";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const MAX_PRICE_LIMIT = 50000;
const MIN_PRICE_LIMIT = 0;

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.meragharsansaar.com/" },
    { name: "Services", url: "https://www.meragharsansaar.com/services" }
  ]);
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
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
    shouldAutoSearch: false, // Flag for auto-search from URL params
  });

  // Category dropdown search state
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const autoSearchPerformed = useRef(false); // Track if auto-search has been performed

  // TEMPORARY FLAG: Set to false when real reviews are available
  const USE_MOCK_REVIEWS = false;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const minPrice = Number(params.get("minPrice")) || MIN_PRICE_LIMIT;
    const maxPrice = Number(params.get("maxPrice")) || MAX_PRICE_LIMIT;
    const categoryParam = params.get("category");
    const searchParam = params.get("search") || params.get("title") || params.get("location") || "";

    // Reset auto-search performed flag when URL changes
    autoSearchPerformed.current = false;

    const newFilters = {
      search: searchParam,
      price: [minPrice, maxPrice],
      category: categoryParam || "all",
      autoFilled: params.get("autoFilled") || "",
      shouldAutoSearch: !!location.search, // Set to true if there are any URL params
    };

    setFilters(newFilters);
  }, [location.search]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategorySearchOpen(false);
        setCategorySearchTerm("");
      }
    };

    if (categorySearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categorySearchOpen]);

  useEffect(() => {
    const initializeData = async () => {
      if (dataInitialized) return; // Prevent multiple initializations

      try {
        setDataInitialized(true);

        // First fetch categories and reviews
        const [categoriesData, reviewsData] = await Promise.all([
          getAllCategoriesAPI(),
          getAllReatingAPI(),
        ]);

        setCategories(categoriesData || []);
        setAllReviews(reviewsData || []);

        // Don't fetch services here - let the auto-search effect handle it
        // This prevents overriding URL params with default empty search
      } catch (error) {
        console.error("Error initializing data:", error);
        setDataInitialized(false); // Reset on error
      }
    };

    initializeData();
  }, []); // Remove dependencies to prevent re-runs

  const fetchServices = useCallback(
    async (
      params: { page?: number; search?: string; category?: string } = {},
    ) => {
      try {
        setLoading(true);
        const filterParams: any = {
          page: params.page || 1,
          limit: PAGE_SIZE,
        };
        if (params.category && params.category !== "all") {
          filterParams.category = params.category;
        }
        if (params.search && params.search.trim()) {
          filterParams.search = params.search.trim();
        }
        const result = await getAllPropertyAPI(filterParams);

        if (result && result.pagination) {
          setServices(result.properties || []);
          setFilteredServices(result.properties || []);
          setTotalPages(result.pagination.totalPages);
          setTotalCount(result.pagination.total);
          setCurrentPage(result.pagination.page);
        } else {
          const allServices = Array.isArray(result) ? result : [];
          setServices(allServices);
          setFilteredServices(allServices);
          setTotalPages(1);
          setTotalCount(allServices.length);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to fetch services");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Auto-search effect - runs once when data is ready
  useEffect(() => {
    // Only run if:
    // 1. Categories are loaded
    // 2. Data is initialized
    // 3. Auto-search hasn't been performed yet
    if (
      categories.length > 0 &&
      dataInitialized &&
      !autoSearchPerformed.current
    ) {
      // Mark as performed to prevent re-runs
      autoSearchPerformed.current = true;

      // If URL params exist, use them; otherwise fetch all services
      if (filters.shouldAutoSearch) {
        // Trigger backend search with URL parameters
        fetchServices({
          page: 1,
          search: filters.search || undefined,
          category: filters.category !== "all" ? filters.category : undefined,
        });
        // Reset the flag in state
        setFilters((prev) => ({ ...prev, shouldAutoSearch: false }));
      } else {
        // No URL params - fetch all services
        fetchServices({ page: 1 });
      }
    }
  }, [categories.length, dataInitialized, filters.shouldAutoSearch, fetchServices]);

  // Note: Removed filters from dependency array so it doesn't auto-filter on every change

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      setCurrentPage(1);
      await fetchServices({
        page: 1,
        search: filters.search?.trim() || undefined,
        category: filters.category !== "all" ? filters.category : undefined,
      });

      // Log the search
      const searchTerm = filters.search?.trim();
      if (searchTerm) {
        logSearch({
          searchQuery: searchTerm,
          category:
            filters.category === "all"
              ? "All Categories"
              : getCategoryNameById(filters.category),
          location: "Unknown",
          page: "Services",
          resultsCount: totalCount,
        });
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
      toast.error("Failed to search services");
    }
  }, [filters, fetchServices, totalCount]);

  const handlePageChange = useCallback(
    async (page: number) => {
      setCurrentPage(page);
      await fetchServices({
        page,
        search: filters.search?.trim() || undefined,
        category: filters.category !== "all" ? filters.category : undefined,
      });
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, fetchServices],
  );

  // Helper function to get category name from ID
  const getCategoryNameById = (categoryId: string) => {
    if (categoryId === "all") return "All Categories";
    const category = categories?.find((cat) => cat._id === categoryId);
    return category?.name || categoryId;
  };

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()),
    );
  }, [categories, categorySearchTerm]);

  const handleCategoryChange = useCallback((value) => {
    setFilters((prevFilters) => ({ ...prevFilters, category: value }));
    setCategorySearchOpen(false);
    setCategorySearchTerm("");
    setSelectedCategoryIndex(-1);

    // Don't fetch services immediately - wait for user to click "Find Services"
  }, []);

  // Handle keyboard navigation in category dropdown
  const handleCategoryKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!categorySearchOpen) return;

      const allOptions = ["all", ...filteredCategories.map((cat) => cat._id)];

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedCategoryIndex((prev) =>
            prev < allOptions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedCategoryIndex((prev) =>
            prev > 0 ? prev - 1 : allOptions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedCategoryIndex >= 0) {
            handleCategoryChange(allOptions[selectedCategoryIndex]);
          }
          break;
        case "Escape":
          setCategorySearchOpen(false);
          setCategorySearchTerm("");
          setSelectedCategoryIndex(-1);
          break;
      }
    },
    [
      categorySearchOpen,
      filteredCategories,
      selectedCategoryIndex,
      handleCategoryChange,
    ],
  );

  const handleHireNow = useCallback(
    (id) => {
      navigate(`/service/${id}`);
    },
    [navigate],
  );

  const handleAddReview = useCallback(
    (serviceId: string, serviceName: string) => {
      if (!token) {
        toast.error("Please login to add a review.");
        navigate("/login");
        return;
      }
      setReviewModal({
        isOpen: true,
        serviceId,
        serviceName,
      });
    },
    [token, navigate],
  );

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

  const getAverageRating = useCallback(
    (serviceId: string) => {
      // First try to get reviews from the populated review field
      const service = services.find((s: any) => s._id === serviceId);
      if (
        service?.review &&
        Array.isArray(service.review) &&
        service.review.length > 0
      ) {
        const total = service.review.reduce(
          (acc: number, r: any) => acc + (r.rating || 0),
          0,
        );
        return Number((total / service.review.length).toFixed(1));
      }

      // Fallback: get reviews from separate API call
      const serviceReviews = allReviews.filter(
        (review: any) => review.property === serviceId,
      );
      if (serviceReviews.length === 0) {
        return 0;
      }
      const total = serviceReviews.reduce(
        (acc: number, r: any) => acc + (r.rating || 0),
        0,
      );
      return Number((total / serviceReviews.length).toFixed(1));
    },
    [services, allReviews],
  );

  const getReviewCount = useCallback(
    (serviceId: string) => {
      // First try to get count from the populated review field
      const service = services.find((s: any) => s._id === serviceId);
      if (service?.review && Array.isArray(service.review)) {
        if (service.review.length > 0) {
          return service.review.length;
        }
      }

      // Fallback: get count from separate API call
      const serviceReviews = allReviews.filter(
        (review: any) => review.property === serviceId,
      );
      const count = serviceReviews.length;

      // Log only when reviews are found
      if (count > 0) {
        console.log(`Service ${serviceId} has ${count} reviews`);
      }

      return count;
    },
    [services, allReviews],
  );
  const toPascalCase = (text) => {
    if (!text) return "";
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getRatingColor = useCallback((rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    if (rating >= 2) return "bg-orange-500";
    return "bg-red-500";
  }, []);

  const clearFilters = useCallback(async () => {
    try {
      // Reset filters
      const clearedFilters = {
        search: "",
        price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
        category: "all",
        autoFilled: "",
        shouldAutoSearch: false,
      };
      setFilters(clearedFilters);
      setCurrentPage(1);

      // Fetch all services fresh from backend
      await fetchServices({ page: 1 });
    } catch (error) {
      console.error("Error clearing filters:", error);
      toast.error("Failed to clear filters");
    }
  }, [fetchServices]);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={seoConfig.services.title}
        description={seoConfig.services.description}
        keywords={seoConfig.services.keywords}
        canonical={seoConfig.services.canonical}
        ogImage={seoConfig.services.ogImage}
      />
      
      {/* Structured Data */}
      <StructuredData data={breadcrumb} />
      
      <Navbar />
      <section className="">
        {/* Header - Sticky Filter & Search */}
        <div
          className="bg-white border-b sticky z-40 shadow-sm"
          style={{ top: "80px" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search Input */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleInputChange}
                    placeholder={toPascalCase(
                      "Search By Vendor Name, Service, Location, City, Pincode...",
                    )}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Trigger search on Enter key
                        handleSearch();
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

              {/* Category Searchable Dropdown, Find Button & Filter Button */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                {/* Custom Searchable Category Dropdown */}
                <div
                  className="relative w-full lg:min-w-[280px]"
                  ref={categoryDropdownRef}
                >
                  <button
                    onClick={() => {
                      setCategorySearchOpen(!categorySearchOpen);
                      setSelectedCategoryIndex(-1);
                    }}
                    onKeyDown={handleCategoryKeyDown}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-left flex items-center justify-between text-base"
                  >
                    <span className="truncate">
                      {toPascalCase(getCategoryNameById(filters.category))}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${categorySearchOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {categorySearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-h-96 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearchTerm}
                            onChange={(e) => {
                              setCategorySearchTerm(e.target.value);
                              setSelectedCategoryIndex(-1);
                            }}
                            onKeyDown={handleCategoryKeyDown}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-base"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Category Options */}
                      <div className="max-h-72 overflow-y-auto">
                        {/* All Categories Option */}
                        <button
                          onClick={() => handleCategoryChange("all")}
                          className={`w-full px-4 py-4 text-left hover:bg-gray-50 flex items-center justify-between text-base ${filters.category === "all"
                            ? "bg-blue-50 text-blue-600"
                            : ""
                            } ${selectedCategoryIndex === 0 ? "bg-gray-100" : ""}`}
                        >
                          <span>
                            {toPascalCase(t("pages.home.allCategories"))}
                          </span>
                          {filters.category === "all" && (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </button>

                        {/* Filtered Categories */}
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat, index) => (
                            <button
                              key={cat._id}
                              onClick={() => handleCategoryChange(cat._id)}
                              className={`w-full px-4 py-4 text-left hover:bg-gray-50 flex items-center justify-between text-base ${filters.category === cat._id
                                ? "bg-blue-50 text-blue-600"
                                : ""
                                } ${selectedCategoryIndex === index + 1 ? "bg-gray-100" : ""}`}
                            >
                              <span className="truncate">
                                {toPascalCase(cat.name)}
                              </span>
                              {filters.category === cat._id && (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-gray-500 text-center text-base">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSearch}
                    className="flex-1 sm:flex-none justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    <span>{toPascalCase("Find Services")}</span>
                  </button>

                  {(filters.search ||
                    filters.category !== "all" ||
                    filters.autoFilled) && (
                      <button
                        onClick={clearFilters}
                        className="flex-none flex items-center justify-center gap-1 px-3 py-2.5 text-red-650 hover:bg-red-50 rounded-lg transition-colors bg-white border border-red-200"
                      >
                        <X className="w-4 h-4" />
                        <span>{toPascalCase("Clear")}</span>
                      </button>
                    )}
                </div>
              </div>
            </div>

            {/* Extended Filters - Removed */}
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
                  {toPascalCase("Showing")} {filteredServices.length}{" "}
                  {toPascalCase("Of")} {totalCount} {toPascalCase("Services")}
                  {totalPages > 1 && (
                    <span className="text-gray-400 ml-1">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                  {filters.search && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {toPascalCase("For")} "{filters.search}"
                    </span>
                  )}
                  {filters.category !== "all" && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {toPascalCase("In")}{" "}
                      {toPascalCase(getCategoryNameById(filters.category))}
                    </span>
                  )}
                  {filters.autoFilled && (
                    <span className="ml-2 text-green-600 font-medium">
                      (
                      {filters.autoFilled
                        .split(",")
                        .map((item) => toPascalCase(item.trim()))
                        .join(" & ")}{" "}
                      {toPascalCase("Services")})
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
              {i18n.language === 'en' && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Service Coming Soon in Your Area 🚀
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    This service is not available at the moment — but we're
                    expanding fast!
                  </p>

                  {/* Service Provider CTA */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <p className="text-gray-700 mb-4 flex items-start justify-center gap-2">
                      <span className="text-2xl">👨‍🔧</span>
                      <span className="text-left">
                        <strong>Are you a service provider?</strong>
                        <br />
                        Register now on our app and start receiving customer
                        leads.
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
                        <strong>Want this service in your area?</strong>
                        <br />
                        Leave your contact details, and we'll notify you when it's
                        live.
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
              )}

              {/* Hindi Section */}
              {i18n.language === 'hi' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    सेवा उपलब्ध नहीं है 😔
                  </h3>
                  <p className="text-gray-600 mb-4 text-lg">
                    क्षमा करें! यह सेवा फिलहाल आपके क्षेत्र में उपलब्ध नहीं है।
                  </p>
                  <p className="text-gray-600 mb-6">
                    हम लगातार नए सेवा प्रदाताओं को जोड़ रहे हैं और जल्द ही यह सेवा
                    आपके क्षेत्र में उपलब्ध होगी।
                  </p>

                  {/* Service Provider CTA - Hindi */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <p className="text-gray-700 mb-4">
                      <span className="text-2xl">👉</span> यदि आप किसी भी प्रकार
                      की सेवा प्रदान करते हैं, तो कृपया हमारे ऐप पर रजिस्टर करें
                      और अपने व्यवसाय को बढ़ाएं।
                    </p>
                    <button
                      onClick={() => navigate("/vendor/register")}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      सेवा प्रदाता के रूप में रजिस्टर करें
                    </button>
                  </div>
                </div>
              )}

              {/* Search Suggestions (if search was used) */}
              {filters.search && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    {toPascalCase("Suggestions")}:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() =>
                        setFilters({ ...filters, search: "plumber" })
                      }
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Plumber")}
                    </button>
                    <button
                      onClick={() =>
                        setFilters({ ...filters, search: "electrician" })
                      }
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Electrician")}
                    </button>
                    <button
                      onClick={() =>
                        setFilters({ ...filters, search: "cleaning" })
                      }
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                    >
                      {toPascalCase("Cleaning")}
                    </button>
                    <button
                      onClick={() =>
                        setFilters({ ...filters, search: "repair" })
                      }
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
                      <div className="md:w-72 h-48 md:h-[40vh] relative flex-shrink-0">
                        <img
                          src={
                            service.images?.[0]?.url ||
                            "https://via.placeholder.com/300x200?text=No+Image"
                          }
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
                                    {service.vendor.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "V"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  {service.vendor.company && (
                                    <p className="text-sm font-bold text-gray-600 truncate">
                                      {filters.search
                                        ? highlightSearchTerm(
                                          toPascalCase(
                                            service.vendor.company,
                                          ),
                                          filters.search,
                                        )
                                        : toPascalCase(service.vendor.company)}
                                    </p>
                                  )}
                                  <p className="text-[12px] text-gray-900 truncate">
                                    {filters.search
                                      ? highlightSearchTerm(
                                        toPascalCase(
                                          service.vendor.name ||
                                          "Vendor Name",
                                        ),
                                        filters.search,
                                      )
                                      : toPascalCase(
                                        service.vendor.name || "Vendor Name",
                                      )}
                                  </p>

                                  {service.vendor.address && (
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                      <MapPin className="w-3 h-3 inline mr-1" />
                                      {filters.search
                                        ? highlightSearchTerm(
                                          toPascalCase(
                                            service.vendor.address,
                                          ),
                                          filters.search,
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
                                    filters.search,
                                  )
                                  : toPascalCase(service.title)}
                              </h3>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-3">
                              {avgRating > 0 ? (
                                <>
                                  <span
                                    className={`${getRatingColor(avgRating)} text-white text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1`}
                                  >
                                    {avgRating}{" "}
                                    <Star className="w-3 h-3 fill-white" />
                                  </span>
                                  <span className="text-gray-600 text-sm">
                                    {reviewCount}{" "}
                                    {reviewCount === 1
                                      ? toPascalCase("Review")
                                      : toPascalCase("Reviews")}
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
                                  {toPascalCase(
                                    service.category?.name || service.category,
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3">
                              {toPascalCase(service.description) ||
                                "Professional Service Provider Offering Quality Services."}
                            </p>

                            {/* Location & Timing */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              {service.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {/* {filters.search ? 
                                      highlightSearchTerm(toPascalCase(service.location), filters.search) :
                                      toPascalCase(service.location)
                                    } */}
                                    {toPascalCase(
                                      service?.vendor?.serviceLocation,
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="bg-white rounded-lg mt- shadow-sm mt-2">
                              <h2 className="text-lg font-bold text-gray-900  flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />{" "}
                                {toPascalCase("Working Hours")}
                              </h2>
                              <div className="bg-gray-50 rounded-lg  px-2">
                                <p className="text-gray-700 font-medium">
                                  {toPascalCase(
                                    service.vendor?.workingDaysTimings,
                                  ) || "Monday - Saturday: 9:00 AM - 6:00 PM"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Price & Actions */}
                          {/* ================= DESKTOP / MD VIEW ================= */}
                          <div className="hidden md:flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:pl-5">
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                {toPascalCase("Contact For Price")}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleHireNow(service._id)}
                                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                {t("common.viewDetails")}
                              </button>

                              <button
                                onClick={() =>
                                  handleAddReview(service._id, service.title)
                                }
                                className="px-4 py-2.5 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {toPascalCase("Add Review")}
                              </button>
                            </div>
                          </div>

                          {/* ================= MOBILE VIEW ================= */}
                          <div className="flex md:hidden flex-col gap-3 pt-3 border-t w-full">
                            {/* Price */}
                            <div className="w-full">
                              <p className="text-lg font-bold text-gray-900 text-center">
                                {toPascalCase("Contact For Price")}
                              </p>
                            </div>

                            {/* View Details Button */}
                            <button
                              onClick={() => handleHireNow(service._id)}
                              className="w-full px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {t("common.viewDetails")}
                            </button>

                            {/* Add Review Button */}
                            <button
                              onClick={() =>
                                handleAddReview(service._id, service.title)
                              }
                              className="w-full px-5 py-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {toPascalCase("Add Review")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-4">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total services)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                {/* Page numbers */}
                {(() => {
                  const pages: number[] = [];
                  const maxVisible = 5;
                  let start = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2),
                  );
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }
                  for (let i = start; i <= end; i++) pages.push(i);
                  return pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      disabled={loading}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {p}
                    </button>
                  ));
                })()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
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
