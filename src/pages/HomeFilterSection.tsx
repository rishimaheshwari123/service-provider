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

  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handlePriceChange = (value) => {
    setFilters({ ...filters, price: value });
  };

  const handleCategoryChange = (value) => {
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

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="w-full py-16 px-4 mb-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Title & Description */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t('filter.smartFilter')}
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
            {t('filter.refineSearch')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mt-3">
            {t('filter.useAdvancedFilters')}
          </p>
        </div>

        {/* Filter Layout - Two Card Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Core Inputs (2/3 width) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
                <Search className="w-5 h-5 mr-2 text-primary" />
                {t('filter.whatLookingFor')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Service Title Search */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-shadow bg-white dark:bg-gray-900">
                <Tag className="w-5 h-5 ml-3 text-gray-500 flex-shrink-0" />
                <Input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleChange}
                  placeholder={t('filter.serviceNameKeyword')}
                  className="border-none shadow-none focus-visible:ring-0 text-base py-3 bg-transparent"
                />
              </div>

              {/* Location Search */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-shadow bg-white dark:bg-gray-900">
                <MapPin className="w-5 h-5 ml-3 text-gray-500 flex-shrink-0" />
                <Input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleChange}
                  placeholder={t('filter.locationPlaceholder')}
                  className="border-none shadow-none focus-visible:ring-0 text-base py-3 bg-transparent"
                />
              </div>

              {/* Category Select */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-shadow bg-white dark:bg-gray-900">
                <Briefcase className="w-5 h-5 ml-3 text-gray-500 flex-shrink-0" />
                <Select value={filters.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full border-none shadow-none focus:ring-0 text-base py-3 h-full bg-transparent">
                    <SelectValue placeholder={t('filter.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">⭐ {t('pages.home.allCategories')}</SelectItem>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>{t('pages.home.loadingCategories')}...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Price Slider Section - Dual Handle */}
            <div className="mt-8 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <IndianRupee className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                        <label className="text-base font-semibold text-gray-800 dark:text-white">
                            {t('filter.budgetRange')}
                        </label>
                    </div>
                    <span className="text-xl font-bold text-primary dark:text-blue-400 bg-primary/10 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                        {formatPrice(filters.price[0])} - {formatPrice(filters.price[1])}
                    </span>
                </div>

                {/* Dual Handle Slider */}
                <Slider
                  min={MIN_PRICE_LIMIT}
                  max={MAX_PRICE_LIMIT}
                  step={1000}
                  value={filters.price}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
                
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>{formatPrice(MIN_PRICE_LIMIT)}</span>
                  <span>{formatPrice(MAX_PRICE_LIMIT)}</span>
                </div>
            </div>
          </div>
          
          {/* Card 2: CTA/Search Button (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col justify-center items-center bg-primary dark:bg-blue-700 p-8 rounded-xl shadow-2xl shadow-primary/40 dark:shadow-blue-700/50">
            <Search className="w-12 h-12 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
                {t('filter.readyToFind')}
            </h3>
            <p className="text-white/80 text-center mb-6">
                {t('filter.clickToSeeServices')}
            </p>
            <Button
              onClick={handleSearch}
              className="w-full bg-white text-primary text-xl font-extrabold hover:bg-gray-100 transition-all shadow-lg py-7"
            >
              <Search className="w-6 h-6 mr-3" />
              {t('filter.startSearching')}
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HomeFilterSection;