import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Star,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  Shield,
  Clock,
  MessageSquare,
} from "lucide-react";
import { getAllPropertyAPI } from "@/service/operations/property";
import { getAllReatingAPI } from "@/service/operations/rating";
import { useNavigate } from "react-router-dom";
import ReviewModal from "@/components/ReviewModal";

// Utility function to truncate text to 4 words
const truncateText = (text: string, wordLimit: number = 4): string => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
};

const ServicesSlider = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    serviceId: string;
    serviceName: string;
  }>({
    isOpen: false,
    serviceId: "",
    serviceName: "",
  });
  const navigate = useNavigate();

  // TEMPORARY FLAG: Set to false when real reviews are available
  const USE_MOCK_REVIEWS = false;

  const fetchServices = async () => {
    try {
      setLoading(true);
      const [allServices, reviews] = await Promise.all([
        getAllPropertyAPI(),
        getAllReatingAPI()
      ]);
      console.log("service", allServices)
      
      setServices(allServices || []);
      setAllReviews(reviews || []);
      
      // Log summary
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

  const handleViewDetails = (id: string) => {
    navigate(`/service/${id}`);
  };

  const handleBrowseAll = () => {
    navigate("/services");
  };

  const handleAddReview = (serviceId: string, serviceName: string) => {
    setReviewModal({
      isOpen: true,
      serviceId,
      serviceName,
    });
  };

  const handleCloseReviewModal = () => {
    setReviewModal({
      isOpen: false,
      serviceId: "",
      serviceName: "",
    });
  };

  const handleReviewAdded = async () => {
    // Refresh reviews after adding a new one
    try {
      const freshReviews = await getAllReatingAPI();
      setAllReviews(freshReviews || []);
      toast.success("Review added successfully!");
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  const getAverageRating = (serviceId: string) => {
    // First try to get reviews from the populated review field
    const service = services.find(s => s._id === serviceId);
    if (service?.review && Array.isArray(service.review) && service.review.length > 0) {
      const total = service.review.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      return parseFloat((total / service.review.length).toFixed(1));
    }
    
    // Fallback: get reviews from separate API call
    const serviceReviews = allReviews.filter((review: any) => review.property === serviceId);
    if (serviceReviews.length === 0) {
      return 0;
    }
    const total = serviceReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    return parseFloat((total / serviceReviews.length).toFixed(1));
  };

  const getReviewCount = (serviceId: string) => {
    // First try to get count from the populated review field
    const service = services.find(s => s._id === serviceId);
    
    if (service?.review && Array.isArray(service.review)) {
      if (service.review.length > 0) {
        return service.review.length;
      }
    }
    
    // Fallback: get count from separate API call
    const serviceReviews = allReviews.filter((review: any) => review.property === serviceId);
    const count = serviceReviews.length;
    
    // Log only when reviews are found
    if (count > 0) {
      console.log(`ServicesSlider - Service ${serviceId} has ${count} reviews`);
    }
    
    return count;
  };

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 4;
    }
    return 4;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, services.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Card width based on screen size
  const getCardWidth = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return window.innerWidth - 32; // Full width minus padding
      if (window.innerWidth < 1024) return 300;
      return 280;
    }
    return 280;
  };

  const [cardWidth, setCardWidth] = useState(getCardWidth());

  useEffect(() => {
    const handleResize = () => {
      setCardWidth(getCardWidth());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Top Rated Services Near You
              </h2>
              <p className="text-gray-500 text-xs md:text-sm">
                Verified professionals with best ratings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-72 h-80 animate-pulse bg-gray-200 rounded-xl"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No services available
          </p>
        ) : (
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (cardWidth + 16)}px)`,
              }}
            >
              {services.map((service, index) => {
                const avgRating = getAverageRating(service._id);
                const reviewCount = getReviewCount(service._id);

                return (
                  <div
                    key={index}
                    onClick={() => handleViewDetails(service._id)}
                    className="flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    style={{ width: cardWidth }}
                  >
                    {/* Image */}
                    <div className="relative h-36 md:h-40 overflow-hidden">
                      <img
                        src={
                          service.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop"
                        }
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded text-white text-xs md:text-sm font-semibold ${
                            avgRating >= 4
                              ? "bg-green-500"
                              : avgRating >= 3
                              ? "bg-yellow-500"
                              : avgRating > 0
                              ? "bg-orange-500"
                              : "bg-gray-400"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-white" />
                          {avgRating > 0 ? avgRating : "New"}
                        </div>
                      </div>
                      {/* Verified Badge */}
                      {avgRating >= 4 && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] md:text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1 text-sm md:text-base group-hover:text-blue-600 transition-colors" title={service.title}>
                        {truncateText(service.title)}
                      </h3>

                      {/* Category */}
                      <p className="text-gray-500 text-xs md:text-sm mb-2" title={service.category || "Professional Service"}>
                        {truncateText(service.category || "Professional Service")}
                      </p>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 text-xs md:text-sm mb-2">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-red-500 flex-shrink-0" />
                        <span className="line-clamp-1" title={service.location || "Location not specified"}>
                          {truncateText(service.location || "Location not specified")}
                        </span>
                      </div>

                      {/* Timing */}
                      <div className="flex items-center text-xs md:text-sm mb-3">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span className="text-green-600 font-medium">Open</span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-gray-500">9AM - 9PM</span>
                      </div>

                      {/* Reviews & Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-500 text-xs md:text-sm">
                          {reviewCount > 0 ? `${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}` : 'No reviews yet'}
                        </span>
                       
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
                      <button 
                        onClick={() => handleViewDetails(service._id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                      >
                        <Phone className="w-4 h-4" />
                        Contact Now
                      </button>
                      <button
                        onClick={() => handleAddReview(service._id, service.title)}
                        className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium py-2 md:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Add Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View All */}
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={handleBrowseAll}
            className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 border-2 border-blue-600 text-blue-600 font-medium rounded-full hover:bg-blue-600 hover:text-white transition-colors text-sm md:text-base"
          >
            View All Services
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleCloseReviewModal}
        serviceId={reviewModal.serviceId}
        serviceName={reviewModal.serviceName}
        onReviewAdded={handleReviewAdded}
      />
    </section>
  );
};

export default ServicesSlider;
