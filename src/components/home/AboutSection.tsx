import { Target, Award, Users } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: "Find Perfect Match",
      description:
        "Connect with pre-vetted service providers who match your specific requirements and budget.",
    },
    {
      icon: Award,
      title: "Verified Experts",
      description:
        "All our service providers are thoroughly verified with proven track records and client reviews.",
    },
    {
      icon: Users,
      title: "Easy Collaboration",
      description:
        "Seamlessly communicate, share files, and manage projects with your chosen service provider.",
    },
  ];

  return (
    <section id="about" className="py-0 ">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">HireExpert</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            The fastest and most reliable way to find and hire top service providers
            for any project or task.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elegant animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                <feature.icon className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
