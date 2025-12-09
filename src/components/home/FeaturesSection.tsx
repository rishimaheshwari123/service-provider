import {
  Zap,
  Shield,
  Rocket,
  HeadphonesIcon,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

// **NOTE:** Ensure your project has the 'gradient-text' and relevant animation classes defined.

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Hiring",
      description:
        "Post your requirement and receive competitive proposals from qualified experts within just a few hours.",
    },
    {
      icon: Shield,
      title: "Secure Escrow",
      description:
        "Payments are held securely in escrow and released only upon your complete satisfaction with the delivered work.",
    },
    {
      icon: Rocket,
      title: "High Quality Output",
      description:
        "Work exclusively with pre-vetted professionals who have verifiable records of delivering excellent results.",
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Expert Support",
      description: "Our dedicated support team is available around the clock to assist you with any platform or project issues.",
    },
    {
      icon: TrendingUp,
      title: "Transparent Pricing",
      description:
        "Easily compare quotes and choose service providers that fit your exact budget without hidden fees.",
    },
    {
      icon: Clock,
      title: "Maximized Time Savings",
      description:
        "Stop wasting time searching. Our matching system connects you with the right experts instantly.",
    },
  ];

  return (
    // Increased padding for better visual separation
    <section id="features" className="py-5 md:py-5 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
            WHY HIRE ON OUR PLATFORM
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Unlock Key <span className="gradient-text">Benefits</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We provide all the tools and assurance needed to find, hire, and manage top-tier talent effortlessly.
          </p>
        </div>

        {/* Features Grid - 3-Column Layout with Advanced Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              // Card Styling: Clean, prominent shadow, and lift on hover
              className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-500 shadow-xl shadow-gray-200/50 dark:shadow-black/20 transform hover:-translate-y-2 hover:border-primary animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon Container: Vibrant, primary color background with subtle shadow */}
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:scale-105">
                <feature.icon className="text-white" size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Optional: Add a subtle CTA at the bottom */}
        <div className="mt-16 text-center">
             <p className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3">
                 <CheckCircle className="w-6 h-6 text-green-500" />
                 Ready to experience the difference? Start hiring today!
             </p>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;