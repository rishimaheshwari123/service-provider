import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have a standard Input component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// You'll likely need these icons from a library like lucide-react
import { Search, MapPin, Briefcase } from "lucide-react";

const TopSearchBar = () => {
  const [filters, setFilters] = useState({
    category: "all",
    location: "",
  });

  const navigate = useNavigate();

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    // Build URL parameters
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);
    if (filters.location) params.append("location", filters.location);

    // Navigate to /services page with filters
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="hidden lg:flex justify-center p-4 bg-primary  border-b border-gray-200">
      <div className="flex w-full shadow-xl rounded-xl overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-2xl">
        {/* Category Select */}
        <div className="flex items-center bg-white border-r border-gray-200 w-1/4">
          <Briefcase className="w-5 h-5 ml-4 text-primary" />
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full border-none shadow-none focus:ring-0 text-base font-medium">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="tutoring">Tutoring</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Input */}
        <div className="flex items-center bg-white w-2/4 px-4 border-r border-gray-200">
          <MapPin className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
          {/* Using the hypothetical Input component for consistency */}
          <Input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Enter Location (e.g., City, Zip)"
            className="w-full border-none shadow-none focus-visible:ring-0 placeholder:text-gray-500 text-base"
          />
        </div>

        {/* Search Button */}
        <div className="w-1/4">
          <Button
            onClick={handleSearch}
            // Use your primary color for a vibrant look
            className="w-full h-full text-base font-semibold rounded-none bg-blue-500 hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopSearchBar;
