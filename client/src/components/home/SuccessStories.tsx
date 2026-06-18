import successStory1 from "@/assets/success1.jpg";
import successStory2 from "@/assets/success2.jpg";
import successStory3 from "@/assets/success3.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, Users } from "lucide-react";

// **NOTE:** Ensure your project has the 'gradient-text' and 'variant="hero"' styles defined.

const SuccessStories = () => {
  const stories = [
    {
      title: "Local Electrician Doubled Bookings",
      description:
        "Ravi, an independent electrician, leveraged our platform's local visibility to gain 40+ new clients in the first month.",
      metric: "40+ NEW CLIENTS",
      image: successStory1,
      metricIcon: Users,
    },
    {
      title: "Freelance Designer Built Strong Brand",
      description:
        "Priya, a freelance graphic designer, connected with multiple high-value startups, boosting her monthly income by 180%.",
      metric: "180% GROWTH",
      image: successStory2,
      metricIcon: TrendingUp,
    },
    {
      title: "Home Cleaning Vendor Expanded Team",
      description:
        "CleanPro Services received continuous, high-volume bookings from verified clients, enabling them to hire more staff and scale quickly.",
      metric: "5X BOOKINGS",
      image: successStory3,
      metricIcon: Zap,
    },
  ];

  return (
    // Dark background for contrast and premium feel
    <section className="py-20 md:py-32 bg-gray-900 dark:bg-black">
      <div className="container mx-auto px-4">
        
        {/* Header Section - White Text on Dark Background */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-2">
            PROVEN RESULTS
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Vendor <span className="gradient-text">Success Stories</span>
          </h2>
          <p className="text-xl text-gray-400">
            Real professionals. Real growth. See how our platform changes businesses.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {stories.map((story, index) => (
            <div
              key={index}
              // Card Styling: White/Light background, strong shadow, and lift on hover
              className="group rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500 shadow-2xl shadow-black/30 transform hover:-translate-y-2 hover:shadow-blue-500/30 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              
              {/* Image and Metric Overlay Area */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Metric Badge: Large, high-contrast, professional look */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-end justify-start p-4">
                    <div className="px-4 py-2 rounded-lg bg-primary/90 backdrop-blur-sm shadow-xl flex items-center gap-2">
                        <story.metricIcon className="w-5 h-5 text-white" />
                        <span className="text-lg font-bold text-white uppercase">{story.metric}</span>
                    </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">{story.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-base line-clamp-3">
                  {story.description}
                </p>
                
                {/* CTA Button - Primary Focus */}
                <Button variant="ghost" className="w-full group/btn text-primary hover:bg-primary/10 transition-colors font-semibold">
                  Read Full Story
                  <ArrowRight
                    className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                    size={18}
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Global CTA - Prominent and action-oriented */}
        <div className="text-center mt-20">
          <Button variant="hero" size="lg" className="group text-xl font-bold py-7 px-10 shadow-2xl shadow-blue-500/40">
            Start Your Success Story Today
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;