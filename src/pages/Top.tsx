import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { getAllCategoriesAPI } from "@/service/operations/category"; // Assuming this path is correct

const TopSearchBar = () => {
  const [filters, setFilters] = useState({
    category: "all",
    location: "",
  });
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  // ✅ Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      // Assuming getAllCategoriesAPI returns data
      const data = await getAllCategoriesAPI();

      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value });
  };

  const handleChange = (e) => {
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
    // 💡 Outer container for full width background and padding
    <div className="hidden lg:flex justify-center w-full  py-3 px-4">
      {/* 💡 Inner Content Wrapper: Full width look with max-width and strong visual presence */}
      <div className="flex w-full max-w-7xl h-16 bg-white shadow-2xl shadow-primary/20 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300">
        {/* 1. Category Select - Styled as a prominent dropdown */}
        <div className="flex items-center w-1/4 min-w-[220px] bg-white border-r border-gray-200 group focus-within:ring-2 focus-within:ring-primary focus-within:z-10 transition-shadow">
          <Briefcase className="w-5 h-5 ml-4 text-primary" />
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger
              className="w-full h-full border-none shadow-none focus:ring-0 text-base font-semibold bg-transparent placeholder:font-normal"
              aria-label="Select Category"
            >
              <SelectValue placeholder="Select Service Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">⭐ All Categories</SelectItem>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="loading">
                  Loading Categories...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Location Input - Main search field, flexible width */}
        <div className="flex items-center w-2/4 px-6 border-r border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:z-10 transition-shadow">
          <MapPin className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
          <Input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Enter City, State, or Zip Code"
            className="w-full h-full border-none shadow-none focus-visible:ring-0 placeholder:text-gray-500 text-base font-medium"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        {/* 3. Search Button - High contrast, impactful button */}
        <div className="w-1/4 min-w-[180px]">
          <Button
            onClick={handleSearch}
            className="w-full h-full text-lg font-bold rounded-none bg-primary hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2 uppercase"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
            Find Services
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopSearchBar;
