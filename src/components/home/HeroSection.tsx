import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

const HeroSection = () => {
  const heroImages = [
    { src: heroSlide1, alt: "Professional service providers collaboration" },
    { src: heroSlide2, alt: "Expert freelancers at work" },
    { src: heroSlide3, alt: "Successful business partnership" },
    { src: heroSlide4, alt: "Team of expert professionals" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent-green/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Hire Expert Professionals &{" "}
              <span className="gradient-text">Get Your Job Done</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground">
              Save your time and money by connecting with verified service
              providers who deliver quality results
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Find Experts Now
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Button>
              <Button variant="outline" size="lg">
                Browse Services
              </Button>
            </div>

            <div className="pt-4 flex items-center gap-8 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div>Experts</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div>Satisfaction</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div>Available</div>
              </div>
            </div>
          </div>

          {/* Hero Image Slider */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent-green/20 rounded-2xl blur-3xl" />
              <Carousel
                className="relative w-full"
                plugins={[
                  Autoplay({
                    delay: 3000,
                  }),
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {heroImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="relative rounded-2xl shadow-elegant w-full h-auto"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
