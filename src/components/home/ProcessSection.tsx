import { FileSearch, Lightbulb, Code, Rocket } from "lucide-react";

const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      icon: FileSearch,
      title: "Discovery",
      description: "We start by understanding your business goals, challenges, and requirements through comprehensive analysis.",
    },
    {
      number: "02",
      icon: Lightbulb,
      title: "Strategy",
      description: "Our experts develop a customized strategy aligned with your objectives and industry best practices.",
    },
    {
      number: "03",
      icon: Code,
      title: "Development",
      description: "We build and implement solutions using cutting-edge technology and agile methodologies.",
    },
    {
      number: "04",
      icon: Rocket,
      title: "Launch & Support",
      description: "We deploy your solution and provide ongoing support to ensure continued success and growth.",
    },
  ];

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-green rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="gradient-text">Process</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            A proven methodology that delivers exceptional results
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Connecting line (hidden on mobile, shown on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent z-0" />
                )}

                <div className="relative z-10 p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elegant group">
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
                  
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                    <step.icon className="text-primary-foreground" size={28} />
                  </div>

                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
