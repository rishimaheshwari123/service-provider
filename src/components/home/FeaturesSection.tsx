import {
  Zap,
  Shield,
  Rocket,
  HeadphonesIcon,
  TrendingUp,
  Clock,
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Quick Hiring",
      description:
        "Post your requirement and receive proposals from qualified experts within hours.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Milestone-based payments with escrow protection for your peace of mind.",
    },
    {
      icon: Rocket,
      title: "Quality Guaranteed",
      description:
        "Work with pre-vetted professionals who have proven track records.",
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Our team is available around the clock to help with any issues.",
    },
    {
      icon: TrendingUp,
      title: "Budget Friendly",
      description:
        "Compare quotes and choose service providers that fit your budget perfectly.",
    },
    {
      icon: Clock,
      title: "Save Time",
      description:
        "Stop searching endlessly. We connect you with the right experts instantly.",
    },
  ];

  return (
    <section id="features" className="py-0 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Platform <span className="gradient-text">Benefits</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to find, hire, and work with the best service providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
