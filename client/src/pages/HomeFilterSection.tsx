import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Briefcase, IndianRupee, Tag } from "lucide-react";
import { getAllCategoriesAPI } from "@/service/operations/category";

const MIN_PRICE_LIMIT = 0;
const MAX_PRICE_LIMIT = 50000;

const HomeFilterSection = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    title: "",
    price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
    location: "",
    category: "all",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, price: value });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.title) params.append("title", filters.title);
    if (filters.location) params.append("location", filters.location);
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);

    params.append("minPrice", String(filters.price[0]));
    params.append("maxPrice", String(filters.price[1]));

    navigate(`/services?${params.toString()}`);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

  return (
    <div className="w-full py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title & Description */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            {t("filter.smartFilter", "SMART FILTER")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            {t("filter.refineSearch", "Refine Your Service Search")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-2">
            {t(
              "filter.useAdvancedFilters",
              "Use advanced filters to pinpoint the exact professional you need."
            )}
          </p>
        </div>

        {/* Filter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Core Inputs */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              {t("filter.whatLookingFor", "What Are You Looking For?")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Service Title Search */}
              <div className="flex items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-600 transition-shadow bg-gray-50">
                <Tag className="w-5 h-5 ml-3 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleChange}
                  placeholder={t(
                    "filter.serviceNameKeyword",
                    "Service Name/Keyword"
                  )}
                  className="border-none shadow-none focus-visible:ring-0 text-sm py-3 bg-transparent"
                />
              </div>

              {/* Location Search */}
              <div className="flex items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-600 transition-shadow bg-gray-50">
                <MapPin className="w-5 h-5 ml-3 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleChange}
                  placeholder={t(
                    "filter.locationPlaceholder",
                    "Location (City or State)"
                  )}
                  className="border-none shadow-none focus-visible:ring-0 text-sm py-3 bg-transparent"
                />
              </div>

              {/* Category Select */}
              <div className="flex items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-600 transition-shadow bg-gray-50">
                <Briefcase className="w-5 h-5 ml-3 text-gray-400 flex-shrink-0" />
                <Select
                  value={filters.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full border-none shadow-none focus:ring-0 text-sm py-3 h-full bg-transparent">
                    <SelectValue
                      placeholder={t("filter.selectCategory", "All Categories")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      ⭐ {t("pages.home.allCategories", "All Categories")}
                    </SelectItem>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {t("pages.home.loadingCategories", "Loading")}...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Slider Section */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="text-sm font-semibold text-gray-800">
                    {t("filter.budgetRange", "Budget Range")}
                  </label>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {formatPrice(filters.price[0])} -{" "}
                  {formatPrice(filters.price[1])}
                </span>
              </div>

              <Slider
                min={MIN_PRICE_LIMIT}
                max={MAX_PRICE_LIMIT}
                step={1000}
                value={filters.price}
                onValueChange={handlePriceChange}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{formatPrice(MIN_PRICE_LIMIT)}</span>
                <span>{formatPrice(MAX_PRICE_LIMIT)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: CTA/Search Button - Blue Theme */}
          <div className="lg:col-span-1 flex flex-col justify-center items-center bg-blue-600 p-6 rounded-xl shadow-lg">
            <Search className="w-10 h-10 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-2 text-center">
              {t("filter.readyToFind", "Ready to Find?")}
            </h3>
            <p className="text-white/80 text-sm text-center mb-4">
              {t(
                "filter.clickToSeeServices",
                "Click the button to see services matching your criteria."
              )}
            </p>
            <Button
              onClick={handleSearch}
              className="w-full bg-white text-blue-600 font-bold hover:bg-gray-100 transition-all py-3"
            >
              <Search className="w-5 h-5 mr-2" />
              {t("filter.startSearching", "Start Searching")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFilterSection;
