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
import { Search, MapPin, Briefcase } from "lucide-react";
import { getAllCategoriesAPI } from "@/service/operations/category";

const TopSearchBar = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    category: "all",
    location: "",
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

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);
    if (filters.location) params.append("location", filters.location);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="hidden lg:flex justify-center w-full py-3 px-4">
      <div className="flex w-full max-w-7xl h-14 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Category Select */}
        <div className="flex items-center w-1/4 min-w-[220px] bg-white border-r border-gray-200 focus-within:ring-2 focus-within:ring-blue-600 focus-within:z-10 transition-shadow">
          <Briefcase className="w-5 h-5 ml-4 text-blue-600" />
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger
              className="w-full h-full border-none shadow-none focus:ring-0 text-base font-medium bg-transparent"
              aria-label={t("pages.home.selectCategory", "Select Category")}
            >
              <SelectValue
                placeholder={t(
                  "pages.home.selectServiceCategory",
                  "All Categories"
                )}
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
                <SelectItem disabled value="loading">
                  {t("pages.home.loadingCategories", "Loading")}...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Location Input */}
        <div className="flex items-center flex-1 px-4 border-r border-gray-200 focus-within:ring-2 focus-within:ring-blue-600 focus-within:z-10 transition-shadow">
          <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <Input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder={t(
              "pages.home.enterLocation",
              "Enter City, State, or Zip Code"
            )}
            className="w-full h-full border-none shadow-none focus-visible:ring-0 placeholder:text-gray-400 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        {/* Search Button - Blue Theme */}
        <div className="w-1/4 min-w-[180px]">
          <Button
            onClick={handleSearch}
            className="w-full h-full text-base font-semibold rounded-none bg-blue-600 hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
            aria-label={t("common.search", "Search")}
          >
            <Search className="w-5 h-5" />
            {t("pages.home.findServices", "FIND SERVICES")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopSearchBar;
