import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent-green/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Transform Your Business with{" "}
              <span className="gradient-text">Modern Solutions</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground">
              Expert services tailored to drive growth, innovation, and success
              for your organization
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Get Started
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>

            <div className="pt-4 flex items-center gap-8 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div>Projects</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div>Success Rate</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div>Support</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent-green/20 rounded-2xl blur-3xl" />
              <img
                src={heroImage}
                alt="Professional team collaboration"
                className="relative rounded-2xl shadow-elegant w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
