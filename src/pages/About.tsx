import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Heart, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission Driven",
      description:
        "We're committed to helping businesses achieve their full potential through innovative solutions.",
    },
    {
      icon: Heart,
      title: "Passion",
      description:
        "Our team is passionate about technology and dedicated to delivering excellence in every project.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description:
        "We believe in the power of teamwork and building strong partnerships with our clients.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Quality is at the core of everything we do, from initial consultation to final delivery.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="">
        {/* Hero Section */}
        <section className="py-10 bg-gradient-to-br from-primary/10 via-background to-accent-blue/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About <span className="gradient-text">ProServe</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to revolutionize how businesses leverage
                technology to achieve their goals.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in">
                  <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                  <p className="text-muted-foreground mb-4">
                    Founded in 2020, ProServe emerged from a simple idea:
                    businesses deserve better technology solutions that are both
                    powerful and accessible.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    What started as a small team of dedicated professionals has
                    grown into a leading service provider, trusted by hundreds
                    of businesses worldwide.
                  </p>
                  <p className="text-muted-foreground">
                    Today, we continue to push boundaries, innovate
                    relentlessly, and put our clients' success at the center of
                    everything we do.
                  </p>
                </div>
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-card border border-border">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        500+
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Projects Completed
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-card border border-border">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        98%
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Client Satisfaction
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-card border border-border">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        50+
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Team Members
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-card border border-border">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        24/7
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Support Available
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-10 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                These core principles guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elegant animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow">
                    <value.icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                The talented people behind ProServe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: "John Smith", role: "CEO & Founder" },
                { name: "Sarah Johnson", role: "CTO" },
                { name: "Michael Chen", role: "Lead Designer" },
              ].map((member, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-24 h-24 rounded-full gradient-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
