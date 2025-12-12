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

const Index = () => {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid />
        <br />
        <TopSearchBar />

        <ServicesSlider />
        <HomeFilterSection />
        <AboutSection />
        <ProcessSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <SuccessStories />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
