import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ExternalLink } from "lucide-react";

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryImages = [
    {
      id: 1,
      src: "/src/assets/hero-slide-1.jpg",
      title: "Professional Services",
      category: "Business",
      description: "Expert consulting and business solutions"
    },
    {
      id: 2,
      src: "/src/assets/service-development.jpg",
      title: "Development Projects",
      category: "Technology",
      description: "Custom software development and solutions"
    },
    {
      id: 3,
      src: "/src/assets/success1.jpg",
      title: "Success Stories",
      category: "Achievement",
      description: "Client success and project completions"
    },
    {
      id: 4,
      src: "/src/assets/service-consulting.jpg",
      title: "Consulting Excellence",
      category: "Strategy",
      description: "Strategic planning and business consulting"
    },
    {
      id: 5,
      src: "/src/assets/hero-slide-2.jpg",
      title: "Innovation Hub",
      category: "Innovation",
      description: "Cutting-edge solutions and technologies"
    },
    {
      id: 6,
      src: "/src/assets/service-training.jpg",
      title: "Training Programs",
      category: "Education",
      description: "Professional training and skill development"
    },
    {
      id: 7,
      src: "/src/assets/success2.jpg",
      title: "Project Excellence",
      category: "Quality",
      description: "High-quality project delivery"
    },
    {
      id: 8,
      src: "/src/assets/hero-slide-3.jpg",
      title: "Digital Solutions",
      category: "Digital",
      description: "Modern digital transformation services"
    }
  ];

  const categories = ["All", "Business", "Technology", "Achievement", "Strategy", "Innovation", "Education", "Quality", "Digital"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages = activeCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <section className="py-10 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            Our Work Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our portfolio of successful projects and see the quality of work we deliver
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedImage(image.id)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <span className="inline-block px-3 py-1 bg-orange-500 rounded-full text-xs font-medium mb-2">
                      {image.category}
                    </span>
                    <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                    <p className="text-sm opacity-90">{image.description}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            View Complete Portfolio
            <ExternalLink className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Modal for enlarged image */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {galleryImages.find(img => img.id === selectedImage) && (
                <div>
                  <img
                    src={galleryImages.find(img => img.id === selectedImage)?.src}
                    alt={galleryImages.find(img => img.id === selectedImage)?.title}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium mb-3">
                      {galleryImages.find(img => img.id === selectedImage)?.category}
                    </span>
                    <h3 className="text-2xl font-bold mb-2">
                      {galleryImages.find(img => img.id === selectedImage)?.title}
                    </h3>
                    <p className="text-gray-600">
                      {galleryImages.find(img => img.id === selectedImage)?.description}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;