import { Target, Award, Users } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To empower businesses with innovative solutions that drive measurable results and sustainable growth.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Committed to delivering the highest quality services with attention to detail and industry expertise.",
    },
    {
      icon: Users,
      title: "Client-First",
      description:
        "Your success is our priority. We build lasting partnerships through transparency and dedication.",
    },
  ];

  return (
    <section id="about" className="py-0 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="gradient-text">ProServe</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            We're a team of passionate professionals dedicated to transforming
            how businesses operate in the digital age.
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
