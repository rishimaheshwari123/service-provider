import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, ChevronDown, CheckCircle } from "lucide-react";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { logSearch } from "@/utils/searchLogger";

const TopSearchBar = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    category: "all",
    location: "",
    search: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategorySearchOpen(false);
        setCategorySearchTerm("");
        setSelectedCategoryIndex(-1);
      }
    };

    if (categorySearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [categorySearchOpen]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categories, categorySearchTerm]);

  // Helper function to get category name from ID
  const getCategoryNameById = (categoryId: string) => {
    if (categoryId === "all") return t("pages.home.allCategories", "All Categories");
    const category = categories?.find(cat => cat._id === categoryId);
    return category?.name || categoryId;
  };

  const handleCategoryChange = useCallback((value: string) => {
    setFilters({ ...filters, category: value });
    setCategorySearchOpen(false);
    setCategorySearchTerm("");
    setSelectedCategoryIndex(-1);
  }, [filters]);

  // Handle keyboard navigation in category dropdown
  const handleCategoryKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!categorySearchOpen) return;
    
    const allOptions = ["all", ...filteredCategories.map(cat => cat._id)];
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedCategoryIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedCategoryIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
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
  }, [categorySearchOpen, filteredCategories, selectedCategoryIndex, handleCategoryChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);
    
    // Combine both location and search into a single search parameter
    const searchTerms = [];
    if (filters.location) searchTerms.push(filters.location);
    if (filters.search) searchTerms.push(filters.search);
    
    const searchQuery = searchTerms.join(" ");
    
    if (searchTerms.length > 0) {
      params.append("search", searchQuery);
    }
    
    // Log the search
    logSearch({
      searchQuery: searchQuery || "empty search",
      category: filters.category === "all" ? "All Categories" : (categories.find(cat => cat._id === filters.category)?.name || filters.category),
      location: filters.location || "Unknown",
      page: "Home",
    });
    
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="hidden lg:flex justify-center w-full py-3 px-4 relative z-50">
      <div className="flex w-full max-w-7xl h-14 bg-white shadow-lg rounded-xl border border-gray-200 overflow-visible relative">
        {/* Category Select */}
        <div className="flex items-center w-1/4 min-w-[300px] bg-white border-r border-gray-200 focus-within:ring-2 focus-within:ring-blue-600 focus-within:z-10 transition-shadow relative overflow-visible" ref={categoryDropdownRef}>
          <Briefcase className="w-5 h-5 ml-4 text-blue-600" />
          <button
            onClick={() => {
              setCategorySearchOpen(!categorySearchOpen);
              setSelectedCategoryIndex(-1);
            }}
            onKeyDown={handleCategoryKeyDown}
            className="w-full h-full px-4 py-3 text-left flex items-center justify-between text-base font-medium bg-transparent border-none focus:outline-none focus:ring-0"
            aria-label={t("pages.home.selectCategory", "Select Category")}
          >
            <span className="truncate">
              {getCategoryNameById(filters.category)}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${categorySearchOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Category Dropdown - Positioned directly below this button */}
          {categorySearchOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] max-h-96 overflow-hidden">
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
                  className={`w-full px-4 py-4 text-left hover:bg-gray-50 flex items-center justify-between text-base ${
                    filters.category === "all" ? "bg-blue-50 text-blue-600" : ""
                  } ${selectedCategoryIndex === 0 ? "bg-gray-100" : ""}`}
                >
                  <span>⭐ {t("pages.home.allCategories", "All Categories")}</span>
                  {filters.category === "all" && <CheckCircle className="w-5 h-5" />}
                </button>
                
                {/* Filtered Categories */}
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat, index) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat._id)}
                      className={`w-full px-4 py-4 text-left hover:bg-gray-50 flex items-center justify-between text-base ${
                        filters.category === cat._id ? "bg-blue-50 text-blue-600" : ""
                      } ${selectedCategoryIndex === index + 1 ? "bg-gray-100" : ""}`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {filters.category === cat._id && <CheckCircle className="w-5 h-5" />}
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

        {/* Search Input */}
        <div className="flex items-center flex-1 px-4 border-r border-gray-200 focus-within:ring-2 focus-within:ring-blue-600 focus-within:z-10 transition-shadow">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <Input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Search by vendor name, service, location..."
            className="w-full h-full border-none shadow-none focus-visible:ring-0 placeholder:text-gray-400 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setFilters({ ...filters, location: "" });
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
