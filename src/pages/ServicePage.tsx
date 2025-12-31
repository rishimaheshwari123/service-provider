import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import { getAllCategoriesAPI } from "@/service/operations/category";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const MAX_PRICE_LIMIT = 50000;
const MIN_PRICE_LIMIT = 0;

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    price: [MIN_PRICE_LIMIT, MAX_PRICE_LIMIT],
    location: "",
    category: "all",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // URL Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const minPrice = Number(params.get("minPrice")) || MIN_PRICE_LIMIT;
    const maxPrice = Number(params.get("maxPrice")) || MAX_PRICE_LIMIT;

    const newFilters = {
      title: params.get("title") || "",
      price: [minPrice, maxPrice],
      location: params.get("location") || "",
      category: params.get("category") || "all",
    };
    setFilters(newFilters);
  }, [location.search]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const allServices = await getAllPropertyAPI();
      setServices(allServices);
      setFilteredServices(allServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) applyFilters(filters);
  }, [services, filters]);

  const applyFilters = (newFilters) => {
    const [minPrice, maxPrice] = newFilters.price;

    const filtered = services.filter((service) => {
      const matchTitle = service.title
        ?.toLowerCase()
        .includes(newFilters.title.toLowerCase());
      const matchLocation = service.location
        ?.toLowerCase()
        .includes(newFilters.location.toLowerCase());
      const matchCategory =
        newFilters.category === "all" ||
        service.category?.toLowerCase() === newFilters.category.toLowerCase();

      const servicePrice = Number(service.price);
      const matchPrice = servicePrice >= minPrice && servicePrice <= maxPrice;

      return matchTitle && matchLocation && matchCategory && matchPrice;
    });

    setFilteredServices(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleCategoryChange = (value) => {
    const newFilters = { ...filters, category: value };
    setFilters(newFilters);
  };

  const handlePriceChange = (value) => {
    const newFilters = { ...filters, price: value };
    setFilters(newFilters);
  };

  const handleHireNow = (id) => {
    navigate(`/service/${id}`);
  };

  // ✅ Calculate average rating
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return total / reviews.length;
  };

  return (
    <>
      <Navbar />
      <section className="py-10 bg-card min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Browse <span className="gradient-text">All Services</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find qualified service providers across multiple categories
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-200 shadow-xl rounded-2xl p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200">
            <div className="col-span-1 md:col-span-3">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-primary-dark">
                🔍 Advanced Filters
              </h3>
            </div>

            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleInputChange}
              placeholder="Search by title..."
              className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-150"
            />

            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="Filter by location..."
              className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-150"
            />

            <Select
              value={filters.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full border rounded-lg px-4 py-3 h-auto bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                )}
              </SelectContent>
            </Select>

            <div className="col-span-1 md:col-span-3 pt-2">
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
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹{MIN_PRICE_LIMIT.toLocaleString()}</span>
                <span>₹{MAX_PRICE_LIMIT.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading services...
            </p>
          ) : filteredServices.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No matching services found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => {
                const avgRating = getAverageRating(service.review);
                const percentage = (avgRating / 5) * 100;

                return (
                  <div
                    key={index}
                    className="group rounded-2xl bg-background border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={
                          service.images?.[0]?.url ||
                          "https://via.placeholder.com/600x400?text=No+Image"
                        }
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {service.description || "No description available"}
                      </p>

                      {/* Stars */}
                      <div className="relative w-28 h-6">
                        <div className="absolute top-0 left-0 w-full h-full flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ccc"
                              strokeWidth={2}
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"
                              />
                            </svg>
                          ))}
                        </div>
                        <div
                          className="absolute top-0 left-0 h-full flex overflow-hidden"
                          style={{ width: `${percentage}%` }}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="yellow"
                              stroke="yellow"
                              strokeWidth={2}
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>

                      {/* <div className="text-sm space-y-1">
                        <p className="text-xl font-bold text-primary">
                          {service.price
                            ? `₹${service.price.toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div> */}

                      <Button
                        variant="outline"
                        className="w-full group/btn"
                        onClick={() => handleHireNow(service._id)}
                      >
                        Hire Now
                        <ArrowRight
                          className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                          size={16}
                        />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ServicesPage;
