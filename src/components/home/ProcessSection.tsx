import { FileSearch, Lightbulb, Code, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      icon: FileSearch,
      title: "Create Your Service Profile",
      description:
        "Vendors list their professional services, defining their scope, competitive pricing, and key areas of expertise.",
    },
    {
      number: "02",
      icon: Lightbulb,
      title: "Maximize Discovery",
      description:
        "Your services are prominently featured to targeted clients. Optimize visibility through high ratings and detailed profiles.",
    },
    {
      number: "03",
      icon: Code,
      title: "Secure Client Booking",
      description:
        "Clients hire you directly via the platform. Seamlessly manage requests, use the integrated chat, and confirm details.",
    },
    {
      number: "04",
      icon: Rocket,
      title: "Complete & Receive Instant Payment",
      description:
        "Deliver the service, receive final client approval, and get paid quickly and securely through our protected escrow system.",
    },
  ];

  return (
    // Dark background for a high-contrast, professional look
    <section className="py-8 md:py-20 bg-gray-950 dark:bg-black relative overflow-hidden">
      
      {/* Background Decoration - Subtle Glows */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in-up">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-2">
            SIMPLIFIED GROWTH
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Our <span className="gradient-text">Vendor Onboarding</span> Flow
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A clear, efficient path for service providers to join the platform, acquire clients, and get paid.
          </p>
        </div>

        {/* Process Flow Layout: Vertical Alignment with Step-by-Step Connectors */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            
            {/* Main Vertical Connector Line (The backbone of the flow) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-700 dark:bg-gray-800 hidden md:block"></div>

            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex mb-12 md:mb-16 last:mb-0 relative animate-fade-in-up`}
                style={{ 
                    animationDelay: `${index * 0.2}s`,
                    // Alternating layout for visual interest (Zig-Zag)
                    justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end'
                }}
              >
                
                {/* 1. The Step Card (Alternating Side) */}
                <div 
                    className={`w-full md:w-[45%] p-6 rounded-xl bg-white dark:bg-gray-800 transition-all duration-500 shadow-2xl shadow-black/40 border border-gray-100 dark:border-gray-700 group hover:shadow-blue-500/30 transform hover:-translate-y-1`}
                >
                    <div className="flex items-center space-x-4 mb-4">
                        {/* Icon Container: Primary color, rotating on hover */}
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-primary/30 transition-transform duration-500 group-hover:rotate-6">
                            <step.icon className="text-white" size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-base">
                        {step.description}
                    </p>
                </div>
                
                {/* 2. Central Connector Point (The large Number) */}
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 hidden md:flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-extrabold text-white shadow-xl shadow-primary/60 border-4 border-gray-950 z-20 transition-all duration-300 group-hover:scale-110">
                        {step.number}
                    </div>
                    {/* Dashed line connecting card to main line (for zig-zag flow) */}
                    {/* Line is styled by position in the main container */}
                </div>
                
                {/* 3. Mobile Connector Line (If on small screens) */}
                {index < steps.length - 1 && (
                    <div className="block md:hidden absolute left-0 top-full w-full h-0.5 bg-gray-700 dark:bg-gray-800" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Final CTA */}
        <div className="text-center mt-5">
            <Button className="group text-lg font-semibold py-7 bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/40">
                Join the Network and Start Earning
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;