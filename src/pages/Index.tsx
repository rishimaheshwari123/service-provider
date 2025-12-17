import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ServicesSlider from "@/components/home/ServicesSlider";
import FeaturesSection from "@/components/home/FeaturesSection";
import ProcessSection from "@/components/home/ProcessSection";
import SuccessStories from "@/components/home/SuccessStories";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ContactSection from "@/components/home/ContactSection";
import HomeFilterSection from "./HomeFilterSection";
import TopSearchBar from "./Top";
import TopBar from "@/components/TopBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import NotificationToast from "@/components/NotificationToast";
import CursorFollower from "@/components/CursorFollower";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import PageTransition from "@/components/PageTransition";
import ScrollProgress from "@/components/ScrollProgress";

import GlassMorphism from "@/components/GlassMorphism";
import AnimatedBackground from "@/components/AnimatedBackground";
import GallerySection from "@/components/home/GallerySection";
import PortfolioShowcase from "@/components/home/PortfolioShowcase";

// New Components
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-rose-500 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 z-50">
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <motion.div
          className="relative w-24 h-24 mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-rose-500 rounded-full animate-spin"></div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent"
        >
          Loading Amazing Experience...
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-4xl mx-auto px-4"
        >
          <LoadingSkeleton />
        </motion.div>
      </div>
    </div>
  </div>
);

const ParallaxBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          "linear-gradient(135deg, #fff7ed 0%, #fef3c7 25%, #fde68a 50%, #fed7aa 75%, #fecaca 100%)",
          "linear-gradient(135deg, #fef7ff 0%, #f3e8ff 25%, #e9d5ff 50%, #ddd6fe 75%, #c7d2fe 100%)",
          "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #bbf7d0 50%, #86efac 75%, #6ee7b7 100%)",
          "linear-gradient(135deg, #fff7ed 0%, #fef3c7 25%, #fde68a 50%, #fed7aa 75%, #fecaca 100%)",
        ],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-rose-50/30" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(251,146,60,0.1)_0%,transparent_50%)] opacity-60" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.1)_0%,transparent_50%)] opacity-60" />
  </div>
);



const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-x-hidden">
        <ScrollProgress />
        <ParallaxBackground />
        
        {/* Header Section */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-40"
        >
          <TopBar />
          <Navbar />
        </motion.div>

      {/* Main Content */}
      <main className="relative z-10 -space-y-2">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mb-0"
        >
          <HeroSection />
        </motion.section>

        {/* Category Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="py-8 bg-gradient-to-br from-white via-orange-50/80 to-rose-50/80 relative overflow-hidden"
        >
          <AnimatedBackground variant="dots" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-rose-100/20"></div>
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CategoryGrid />
          </div>
        </motion.section>

        {/* Search Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="py-6 bg-gradient-to-r from-white via-amber-50/60 to-orange-50/60 relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.08)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <TopSearchBar />
          </div>
        </motion.section>

        {/* Services Section */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-10 bg-gradient-to-br from-white via-rose-50/70 to-orange-50/70 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/15 to-orange-100/15"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-300/25 to-rose-300/25 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-rose-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <ServicesSlider />
          </div>
        </motion.section>

        {/* Filter Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="py-8 bg-gradient-to-r from-white via-amber-50/60 to-yellow-50/60 relative"
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <HomeFilterSection />
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 bg-gradient-to-br from-gray-50 via-white to-orange-50/40 relative overflow-hidden"
        >
          <AnimatedBackground variant="grid" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(251,146,60,0.04)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <AboutSection />
          </div>
        </motion.section>

        {/* Process Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-rose-500/10"></div>
          <div className="absolute -top-5 -left-5 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 -right-5 w-40 h-40 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <ProcessSection />
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, rotateX: 5 }}
          whileInView={{ opacity: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 bg-gradient-to-br from-white via-gray-50 to-rose-50/40 relative overflow-hidden"
        >
          <AnimatedBackground variant="waves" />
          <div className="absolute inset-0 bg-white/92 backdrop-blur-sm"></div>
          <div className="absolute top-1/2 right-0 w-48 h-48 bg-gradient-to-l from-rose-300/25 to-pink-300/25 rounded-full blur-3xl transform translate-x-1/2"></div>
          <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <FeaturesSection />
          </div>
        </motion.section>

        {/* Gallery Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-8 bg-gradient-to-br from-white via-orange-50/60 to-rose-50/60 relative overflow-hidden"
        >
          <AnimatedBackground variant="dots" />
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <GallerySection />
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-8 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/50 to-rose-600/50"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <StatsSection />
          </div>
        </motion.section>

        {/* Portfolio Showcase Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 bg-gradient-to-br from-gray-50 via-white to-rose-50/50 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-br from-rose-200/25 to-pink-200/25 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <PortfolioShowcase />
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-10 bg-gradient-to-br from-gray-50 via-white to-amber-50/50 relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(251,146,60,0.05)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <TestimonialsSection />
          </div>
        </motion.section>

        {/* Success Stories */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-10 bg-gradient-to-r from-white via-rose-50/50 to-orange-50/50 relative"
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-rose-300/25 to-orange-300/25 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <SuccessStories />
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 bg-gradient-to-br from-gray-50 via-white to-orange-50/40 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/15 to-amber-100/15"></div>
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <ContactSection />
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Footer />
      </motion.footer>

      {/* Interactive Components */}
      <ScrollToTopButton />
      <FloatingActionMenu />
      <NotificationToast />
      <CursorFollower />

      {/* Floating Decorative Elements */}
      <div className="fixed top-1/2 left-3 transform -translate-y-1/2 z-30 hidden lg:block">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-3 h-3 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full mb-6 opacity-70 shadow-lg"
        />
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 opacity-50 shadow-lg"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="w-2 h-2 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full opacity-60 shadow-lg"
        />
      </div>

      <div className="fixed top-1/4 right-3 transform -translate-y-1/2 z-30 hidden lg:block">
        <motion.div
          animate={{ x: [0, 12, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-8 opacity-60 shadow-lg"
        />
        <motion.div
          animate={{ x: [0, 18, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-3.5 h-3.5 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-50 shadow-lg"
        />
      </div>

      {/* Bottom Floating Elements */}
      <div className="fixed bottom-1/4 left-1/4 z-30 hidden xl:block">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-6 bg-gradient-to-br from-amber-300/40 to-orange-300/40 rounded-full blur-sm"
        />
      </div>

      <div className="fixed bottom-1/3 right-1/4 z-30 hidden xl:block">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="w-8 h-8 bg-gradient-to-br from-rose-300/30 to-pink-300/30 rounded-full blur-sm"
        />
      </div>
    </div>
    </PageTransition>
  );
};

export default Index;
