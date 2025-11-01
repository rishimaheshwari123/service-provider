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

const Index = () => {
  return (
    <div className="min-h-screen">
      <TopSearchBar />
      <Navbar />
      <main>
        <HeroSection />
        <HomeFilterSection />
        <AboutSection />
        <ServicesSlider />
        <FeaturesSection />
        <ProcessSection />
        <SuccessStories />
        <StatsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
