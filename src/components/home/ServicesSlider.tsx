import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, MapPin, DollarSign, Briefcase } from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import { useNavigate } from "react-router-dom";

const ServicesSlider = () => {
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
  
  // New handler for the global CTA button
  const handleBrowseAll = () => {
    navigate("/services"); // Navigates to the /services page
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return parseFloat((total / reviews.length).toFixed(1));
  };
  
  const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className="w-4 h-4 transition-colors"
            fill={i < fullStars ? "#FFC107" : (i === fullStars && hasHalfStar ? "#FFC107" : "none")}
            stroke={i < rating ? "#FFC107" : "#B0B0B0"}
            strokeWidth={1.5}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {rating > 0 ? rating : 'No ratings'}
        </span>
      </div>
    );
  };

  return (
    <section className="py-5 md:py-10 ">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
                TOP-RATED PROFESSIONALS
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Explore Our Featured <span className="gradient-text">Services</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
                Don't settle for less. Find pre-vetted, qualified service providers across popular categories.
            </p>
        </div>

        {loading ? (
          <p className="text-center text-primary font-medium">
            Loading services, please wait...
          </p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">
            No featured services are available at the moment.
          </p>
        ) : (
          <div className="max-w-7xl mx-auto relative">
            <Carousel className="w-full" opts={{ align: "start", loop: true, dragFree: true }}>
              <CarouselContent className="-ml-4">
                {services.map((service, index) => {
                  const avgRating = getAverageRating(service.review);
                  return (
                    <CarouselItem
                      key={index}
                      // 💡 Changed basis: Two cards per view on large screens
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/2" 
                    >
                      <div className="p-1">
                        {/* Service Card: Thin, Compact, and Hoverable */}
                        <div className="group rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 transform hover:-translate-y-1">
                          
                          {/* Image Area: Reduced Height for 'Thin' look */}
                          <div className="relative h-40 sm:h-48 overflow-hidden">
                            <img
                              src={
                                service.images?.[0]?.url ||
                                "https://via.placeholder.com/600x400?text=Service+Image+Unavailable"
                              }
                              alt={service.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          </div>

                          {/* Content Area: Reduced Padding */}
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-white">
                                    {service.title}
                                </h3>
                            </div>
                            
                            {/* Rating and Reviews */}
                            <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                                <RatingStars rating={avgRating} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({service.review?.length || 0} Reviews)
                                </span>
                            </div>

                            {/* Key Details */}
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-2 text-primary" />
                                    {service.category || "General Service"}
                                </p>
                                <p className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                    {service.location || "Online/Remote"}
                                </p>
                                <p className="flex items-center font-bold text-lg text-green-600 dark:text-green-400 pt-1">
                                    <DollarSign className="w-5 h-5 mr-1" />
                                    {service.price ? `Starts from ₹${service.price.toLocaleString('en-IN')}` : "Price Varies"}
                                </p>
                            </div>
                            
                            {/* CTA Button */}
                            <Button
                              variant="default"
                              className="w-full mt-3 group/btn bg-primary hover:bg-blue-600 text-base font-semibold transition-all shadow-md shadow-primary/30 py-2.5 h-auto"
                              onClick={() => handleHireNow(service._id)}
                            >
                              View Details & Hire
                              <ArrowRight
                                className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {/* Carousel Navigation */}
              <CarouselPrevious className="left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white/80 border shadow-md hidden sm:flex" />
              <CarouselNext className="right-0 translate-x-1/2 top-1/2 -translate-y-1/2 bg-white/80 border shadow-md hidden sm:flex" />
            </Carousel>
          </div>
        )}
        
        {/* Global CTA - Now navigates to /services */}
        <div className="text-center mt-16">
            <Button 
                onClick={handleBrowseAll} // 💡 New click handler
                variant="outline" 
                className="text-lg font-semibold py-6 px-10 border-2 border-primary text-primary hover:bg-primary/10 group"
            >
                Browse All Services Categories
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSlider;