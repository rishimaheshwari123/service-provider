import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllCategoriesAPI } from "@/service/operations/category";

export default function PopularSearches() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  const itemsPerView = 5;
  const cardWidth = 220; // card width + gap
  const totalCards = categories.length;
  const maxIndex = Math.max(0, Math.ceil(totalCards / itemsPerView) - 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto slide every 4 seconds
  useEffect(() => {
    if (categories.length <= itemsPerView) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [categories.length, maxIndex]);

  // Placeholder images for categories
  const placeholderImages = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1555244162-803834f70033?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop",
  ];

  if (categories.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Popular Searches</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cards Slider */}
        <div className="relative overflow-hidden" ref={sliderRef}>
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * itemsPerView * cardWidth}px)`,
            }}
          >
            {categories.map((cat, index) => (
              <div
                key={cat._id}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex-shrink-0 w-[204px] cursor-pointer group"
              >
                {/* Card */}
                <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="h-32 overflow-hidden">
                    <img
                      src={cat.image || placeholderImages[index % placeholderImages.length]}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Blue Footer */}
                  <div className="bg-blue-600 p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">
                      {cat.name}
                    </h3>
                    <button className="bg-white text-blue-600 text-xs font-semibold px-3 py-1.5 rounded hover:bg-blue-50 transition-colors">
                      Enquire Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-blue-600 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
