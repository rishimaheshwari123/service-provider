import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSlider from "@/components/home/ServicesSlider";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ContactSection from "@/components/home/ContactSection";
import TopSearchBar from "./Top";
import CategoryGrid from "@/components/home/CategoryGrid";
import PromoBanner from "@/components/home/PromoBanner";
import PopularSearches from "@/components/home/PopularSearches";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import PageTransition from "@/components/PageTransition";
import ScrollProgress from "@/components/ScrollProgress";
import TypingEffect from "@/components/TypingEffect";
import logoImage from "@/assets/logo.png";

// Scroll to Top Button - Blue Theme
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Loading Spinner - Blue Theme
const LoadingSpinner = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <motion.div
            className="relative w-20 h-20 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-semibold text-blue-600"
          >
            {t("pages.home.loadingExperience", "Loading...")}
          </motion.h2>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <ScrollProgress />
          <Navbar />
        
        {/* MERA GHAR SANSAAR Header - Gradient Theme */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-4 sm:py-6 md:py-4 relative overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-12 sm:w-20 h-12 sm:h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-10 sm:w-16 h-10 sm:h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
            {/* Logo and Title - Responsive Layout */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
              {/* Logo - With Background for Visibility */}
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ 
                  duration: 1, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                className="flex-shrink-0"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-1.5 sm:p-3 md:p-4 shadow-xl border-2 border-white/50">
                  <img 
                    src={logoImage} 
                    alt="Mera Ghar Sansaar Logo" 
                    className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
                  />
                </div>
              </motion.div>
              
              {/* Title with Typing Effect - Gradient Text */}
              <div className="text-center md:text-left">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight drop-shadow-lg">
                  <motion.span 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent"
                  >
                    MERA
                  </motion.span>
                  <br className="block sm:hidden" />
                  <span className="sm:ml-2 md:ml-3">
                    <TypingEffect 
                      text="GHAR SANSAAR" 
                      speed={150}
                      delay={1000}
                      className="bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 bg-clip-text text-transparent"
                    />
                  </span>
                </h1>
                
                {/* Enhanced Gradient Underline */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 2.5 }}
                  className="mt-1 sm:mt-2 md:mt-3 w-16 sm:w-24 md:w-32 h-0.5 sm:h-1 md:h-1.5 bg-gradient-to-r from-yellow-300 via-white to-yellow-300 rounded-full origin-left shadow-lg mx-auto md:mx-0"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Top Search Bar - Category Filter */}
        <TopSearchBar/>
        
        {/* Header - Navbar */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-40"
        >
        </motion.div>

        {/* Main Content */}
        <main className="relative z-10">
          {/* Promo Banner */}
          <section className="py-2 md:py-4 bg-white">
            <PromoBanner />
          </section>

          {/* Category Grid */}
          <section className="py-4 md:py-6 bg-white border-b border-gray-100">
            <CategoryGrid />
          </section>

          {/* Services Section */}
          <section className="py-4 md:py-6 bg-gray-50">
            <ServicesSlider />
          </section>

          {/* Popular Searches */}
          <section className="bg-white border-b border-gray-100">
            <PopularSearches />
          </section>

          {/* Filter Section */}
          {/* <section className="py-4 md:py-6 bg-gray-50">
            <HomeFilterSection />
          </section> */}

          {/* Features Section */}
          <section className="py-6 md:py-10 bg-white">
            <FeaturesSection />
          </section>

          {/* Stats Section - Blue Theme */}
          <section className="py-8 md:py-12 bg-blue-600 text-white">
            <StatsSection />
          </section>

          {/* Testimonials Section */}
          <section className="py-6 md:py-10 bg-white">
            <TestimonialsSection />
          </section>

          {/* Contact Section */}
          <section className="py-6 md:py-10 bg-gray-50">
            <ContactSection />
          </section>
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Components */}
        <ScrollToTopButton />
        <FloatingActionMenu />
      </div>
    </PageTransition>
  );
};

export default Index;
