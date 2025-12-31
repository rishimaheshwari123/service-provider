import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroSlide1 from "@/assets/success1.jpg";
import heroSlide2 from "@/assets/success2.jpg";
import heroSlide3 from "@/assets/success3.jpg";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const heroImages = [
    { src: heroSlide1, alt: t('pages.home.heroImageAlt1', 'Professional service providers collaboration') },
    { src: heroSlide2, alt: t('pages.home.heroImageAlt2', 'Expert freelancers at work') },
    { src: heroSlide3, alt: t('pages.home.heroImageAlt3', 'Successful business partnership') },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mobile background image */}
      <div
        className="absolute inset-0 w-full h-full sm:hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${heroSlide1})` }}
      />

      {/* Carousel background for sm+ */}
      <div className="absolute inset-0 z-0 w-screen h-full hidden sm:block">
        <Carousel
          className="relative w-full h-full"
          plugins={[Autoplay({ delay: 4000 })]}
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Text content */}
      <div className="container mx-auto px-4 relative z-20 py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 animate-fade-in-up text-white">
          {/* Heading */}
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {t('pages.home.heroTitle')}{" "}
            <span className="text-accent-green">{t('pages.home.heroTitleHighlight')}</span>
          </h1>

          {/* Paragraph */}
          <p className="text-xl text-gray-200 sm:text-2xl">
            {t('pages.home.heroSubtitle')}
          </p>

          {/* Buttons */}
       <div className="pt-4 w-full sm:flex sm:justify-center sm:gap-4">
  <Button
    variant="hero"
    size="lg"
    onClick={() => navigate("/services")}
    className="group w-full sm:w-auto bg-accent-green hover:bg-accent-green/90 text-black"
  >
    {t("pages.home.findExpertsNow")}
    <ArrowRight
      className="ml-2 group-hover:translate-x-1 transition-transform"
      size={20}
    />
  </Button>

  {/* Desktop-only second button */}
  <Button
    variant="outline"
    size="lg"
    onClick={() => navigate("/services")}
    className="w-full sm:w-auto border-white text-white hover:bg-white/20 hidden sm:inline-flex"
  >
    {t("pages.home.browseServices")}
  </Button>
</div>


          {/* Desktop-only statistics */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-300 hidden sm:flex">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div>{t('pages.home.experts')}</div>
            </div>
            <div className="h-12 w-px bg-gray-500" />
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">98%</div>
              <div>{t('pages.home.satisfaction')}</div>
            </div>
            <div className="h-12 w-px bg-gray-500" />
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div>{t('pages.home.available')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
