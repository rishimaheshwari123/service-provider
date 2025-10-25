import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import consultingImage from "@/assets/service-consulting.jpg";
import developmentImage from "@/assets/service-development.jpg";
import supportImage from "@/assets/service-support.jpg";
import trainingImage from "@/assets/service-training.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ServicesSlider = () => {
  const services = [
    {
      title: "Business Consultants",
      description: "Hire experienced business consultants to help grow your company with strategic planning and expert insights.",
      image: consultingImage,
      features: ["Strategy Planning", "Market Research", "Business Analysis"],
    },
    {
      title: "Developers & IT",
      description: "Find skilled developers and IT professionals for web, mobile, and software development projects.",
      image: developmentImage,
      features: ["Web Development", "App Development", "Technical Support"],
    },
    {
      title: "Customer Support",
      description: "Hire professional customer support agents to handle your client communications efficiently.",
      image: supportImage,
      features: ["Live Support", "Email Management", "Client Relations"],
    },
    {
      title: "Trainers & Educators",
      description: "Connect with expert trainers and educators for corporate training and skill development programs.",
      image: trainingImage,
      features: ["Corporate Training", "Online Teaching", "Skill Development"],
    },
  ];

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse <span className="gradient-text">Service Categories</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Find qualified service providers across multiple categories
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {services.map((service, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-4">
                    <div className="group rounded-2xl bg-background border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-elegant">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <h3 className="text-2xl font-bold">{service.title}</h3>
                        <p className="text-muted-foreground">{service.description}</p>
                        
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button variant="outline" className="w-full group/btn">
                          Browse Experts
                          <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ServicesSlider;
