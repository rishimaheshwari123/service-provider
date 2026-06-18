import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import hero1 from "@/assets/hero-slide-1.jpg";
import serviceDev from "@/assets/service-development.jpg";
import success1 from "@/assets/success1.jpg";
import consulting from "@/assets/service-consulting.jpg";
import hero2 from "@/assets/hero-slide-2.jpg";
import training from "@/assets/service-training.jpg";
import success2 from "@/assets/success2.jpg";
import hero3 from "@/assets/hero-slide-3.jpg";

const GallerySection = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryImages = [
    {
      id: 1,
      src: hero1,
      title: t('gallery.professionalServices'),
      category: "Business",
      categoryLabel: t('gallery.business'),
      description: t('gallery.expertConsulting'),
    },
    {
      id: 2,
      src: serviceDev,
      title: t('gallery.developmentProjects'),
      category: "Technology",
      categoryLabel: t('gallery.technology'),
      description: t('gallery.customSoftware'),
    },
    {
      id: 3,
      src: success1,
      title: t('gallery.successStories'),
      category: "Achievement",
      categoryLabel: t('gallery.achievement'),
      description: t('gallery.clientSuccess'),
    },
    {
      id: 4,
      src: consulting,
      title: t('gallery.consultingExcellence'),
      category: "Strategy",
      categoryLabel: t('gallery.strategy'),
      description: t('gallery.strategicPlanning'),
    },
    {
      id: 5,
      src: hero2,
      title: t('gallery.innovationHub'),
      category: "Innovation",
      categoryLabel: t('gallery.innovation'),
      description: t('gallery.cuttingEdge'),
    },
    {
      id: 6,
      src: training,
      title: t('gallery.trainingPrograms'),
      category: "Education",
      categoryLabel: t('gallery.education'),
      description: t('gallery.professionalTraining'),
    },
    {
      id: 7,
      src: success2,
      title: t('gallery.projectExcellence'),
      category: "Quality",
      categoryLabel: t('gallery.quality'),
      description: t('gallery.highQuality'),
    },
    {
      id: 8,
      src: hero3,
      title: t('gallery.digitalSolutions'),
      category: "Digital",
      categoryLabel: t('gallery.digital'),
      description: t('gallery.modernDigital'),
    },
  ];

  const categories = [
    { key: "All", label: t('gallery.all') },
    { key: "Business", label: t('gallery.business') },
    { key: "Technology", label: t('gallery.technology') },
    { key: "Achievement", label: t('gallery.achievement') },
    { key: "Strategy", label: t('gallery.strategy') },
    { key: "Innovation", label: t('gallery.innovation') },
    { key: "Education", label: t('gallery.education') },
    { key: "Quality", label: t('gallery.quality') },
    { key: "Digital", label: t('gallery.digital') },
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

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
            {t('gallery.ourWorkGallery')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('gallery.gallerySubtitle')}
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
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.key
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {category.label}
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
                      {image.categoryLabel}
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
            {t('gallery.viewCompletePortfolio')}
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

              {galleryImages.find((img) => img.id === selectedImage) && (
                <div>
                  <img
                    src={
                      galleryImages.find((img) => img.id === selectedImage)?.src
                    }
                    alt={
                      galleryImages.find((img) => img.id === selectedImage)
                        ?.title
                    }
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium mb-3">
                      {
                        galleryImages.find((img) => img.id === selectedImage)
                          ?.categoryLabel
                      }
                    </span>
                    <h3 className="text-2xl font-bold mb-2">
                      {
                        galleryImages.find((img) => img.id === selectedImage)
                          ?.title
                      }
                    </h3>
                    <p className="text-gray-600">
                      {
                        galleryImages.find((img) => img.id === selectedImage)
                          ?.description
                      }
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
