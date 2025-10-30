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

const HomeFilterSection = () => {
  const [filters, setFilters] = useState({
    title: "",
    price: "",
    location: "",
    category: "all",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.title) params.append("title", filters.title);
    if (filters.price) params.append("price", filters.price);
    if (filters.location) params.append("location", filters.location);
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);

    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-10 grid grid-cols-1 md:grid-cols-5 gap-4 max-w-7xl mx-auto">
      <input
        type="text"
        name="title"
        value={filters.title}
        onChange={handleChange}
        placeholder="Search by title"
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        type="number"
        name="price"
        value={filters.price}
        onChange={handleChange}
        placeholder="Max Price"
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        type="text"
        name="location"
        value={filters.location}
        onChange={handleChange}
        placeholder="Search by location"
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <Select value={filters.category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full border rounded-lg px-3 py-2">
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
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        Search
      </Button>
    </div>
  );
};

export default HomeFilterSection;
