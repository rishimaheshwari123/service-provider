import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const MIN_PRICE_LIMIT = 0;
const MAX_PRICE_LIMIT = 50000;

const HomeFilterSection = () => {
  const [filters, setFilters] = useState({
    title: "",
    price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
    location: "",
    category: "all",
  });

  const navigate = useNavigate();

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

    params.append("minPrice", filters.price[0]);
    params.append("maxPrice", filters.price[1]);

    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="bg-primary py-10 px-6 shadow-lg mb-10">
      {/* Title & Description */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Find the Best Services Near You
        </h2>
        <p className="text-white max-w-2xl mx-auto">
          Search, filter, and explore local service providers by category,
          location, and price range. Get what you need quickly and easily!
        </p>
      </div>

      {/* Filter Box */}
      <div className="bg-white shadow-md rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          name="title"
          value={filters.title}
          onChange={handleChange}
          placeholder="Search by title"
          className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Search by location"
          className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="tutoring">Tutoring</SelectItem>
            <SelectItem value="it-support">IT Support</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          Search
        </Button>

        {/* Price Range */}
        <div className="col-span-1 md:col-span-4 pt-2">
          <label className="text-sm font-medium mb-2 block">
            Price Range: ₹{filters.price[0].toLocaleString()} - ₹
            {filters.price[1].toLocaleString()}
          </label>
          <Slider
            name="price"
            min={MIN_PRICE_LIMIT}
            max={MAX_PRICE_LIMIT}
            step={500}
            value={filters.price}
            onValueChange={handlePriceChange}
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹{MIN_PRICE_LIMIT.toLocaleString()}</span>
            <span>₹{MAX_PRICE_LIMIT.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFilterSection;
