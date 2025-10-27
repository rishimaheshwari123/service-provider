import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const allServices = await getAllPropertyAPI();
      setServices(allServices);
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

  const handleHireNow = (id) => {
    navigate(`/service/${id}`);
  };

  return (
    <>
      <Navbar />
      <section className="py-24 bg-card min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Browse <span className="gradient-text">All Services</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find qualified service providers across multiple categories
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading services...
            </p>
          ) : services.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No services available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
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
                        <strong>Type:</strong> {service.type || "N/A"}
                      </p>
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
