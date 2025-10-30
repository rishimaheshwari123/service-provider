import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    price: "",
    location: "",
    category: "all",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Read URL Params on Mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      title: params.get("title") || "",
      price: params.get("price") || "",
      location: params.get("location") || "",
      category: params.get("category") || "all",
    };
    setFilters(newFilters);
  }, [location.search]);

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

  // Apply filters after services are fetched or filters change
  useEffect(() => {
    if (services.length > 0) applyFilters(filters);
  }, [services, filters]);

  const applyFilters = (newFilters) => {
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
      const matchPrice =
        newFilters.price === "" ||
        (service.price && service.price <= Number(newFilters.price));

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

  const handleHireNow = (id) => {
    navigate(`/service/${id}`);
  };

  return (
    <>
      <Navbar />
      <section className="py-24 bg-card min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Browse <span className="gradient-text">All Services</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find qualified service providers across multiple categories
            </p>
          </div>

          {/* 🔍 Filter Section */}
          <div className="bg-white shadow-md rounded-2xl p-6 mb-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleInputChange}
              placeholder="Search by title"
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="number"
              name="price"
              value={filters.price}
              onChange={handleInputChange}
              placeholder="Max Price"
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="Search by location"
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <Select
              value={filters.category}
              onValueChange={handleCategoryChange}
            >
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
          </div>

          {/* 🔹 Service Cards */}
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
              {filteredServices.map((service, index) => (
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

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>Category:</strong> {service.category || "N/A"}
                      </p>
                      <p>
                        <strong>Location:</strong> {service.location || "N/A"}
                      </p>
                      <p>
                        <strong>Price:</strong>{" "}
                        {service.price ? `₹${service.price}` : "N/A"}
                      </p>
                    </div>

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
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ServicesPage;
