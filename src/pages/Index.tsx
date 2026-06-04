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
import SEO from "@/components/common/SEO";
import StructuredData, { organizationSchema, websiteSchema } from "@/components/common/StructuredData";
import { seoConfig } from "@/utils/seoConfig";
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

  // useEffect(() => {
  //   const timer = setTimeout(() => setIsLoading(false), 1000);
  //   return () => clearTimeout(timer);
  // }, []);

  // if (isLoading) {
  //   return <LoadingSpinner />;
  // }

  return (
    <PageTransition>
      {/* SEO Meta Tags */}
      <SEO
        title={seoConfig.home.title}
        description={seoConfig.home.description}
        keywords={seoConfig.home.keywords}
        canonical={seoConfig.home.canonical}
        ogImage={seoConfig.home.ogImage}
      />
      
      {/* Structured Data */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      
      <div className="min-h-screen bg-white overflow-x-hidden">
        <ScrollProgress />

        <div className="w-full bg-slate-900 overflow-hidden py-1.5 md:py-2 border-b border-white/5">
  <div className="max-w-7xl mx-auto px-4 relative flex items-center justify-center">
    
    {/* Background Glow Effect (Subtle) */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>

    <motion.div 
      initial={{ opacity: 0, letterSpacing: "0.2em" }}
      animate={{ opacity: 1, letterSpacing: "0.5em" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative z-10 flex items-center gap-4"
    >
      {/* Left Diamond Icon (Optional, for UK look) */}
      <span className="hidden sm:block h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-yellow-400/50"></span>
      
      <div className="text-center">
        <h2 className="text-[10px] md:text-xl font-bold text-white tracking-[0.4em] md:tracking-[0.6em] uppercase">
          <span className="text-white">Mera Ghar</span>
          <span className="text-yellow-400 ml-2">Sansaar</span>
        </h2>
        
        {/* Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="text-[8px] md:text-sm text-gray-300 tracking-wider uppercase mt-1 md:mt-2"
        >
          One place for all your needs
        </motion.p>
      </div>

      {/* Right Diamond Icon */}
      <span className="hidden sm:block h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-yellow-400/50"></span>
    </motion.div>

    {/* Subtle Shine Animation across the text */}
    <motion.div
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
      className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
    />
  </div>
</div>
          <Navbar />
        
        

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
