import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent-blue/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Contact <span className="gradient-text">Us</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Have a question or ready to start your project? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        placeholder="John"
                        className="bg-card border-border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        placeholder="Doe"
                        className="bg-card border-border"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="bg-card border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="bg-card border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      className="bg-card border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      placeholder="Tell us more about your project..."
                      className="bg-card border-border min-h-[150px]"
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
                <p className="text-muted-foreground mb-8">
                  We're here to help and answer any question you might have. We look forward to hearing from you.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                      <Mail className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Email</div>
                      <div className="text-muted-foreground">contact@proserve.com</div>
                      <div className="text-muted-foreground">support@proserve.com</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                      <Phone className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Phone</div>
                      <div className="text-muted-foreground">+1 (555) 123-4567</div>
                      <div className="text-muted-foreground">+1 (555) 765-4321</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                      <MapPin className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Office</div>
                      <div className="text-muted-foreground">123 Business Street</div>
                      <div className="text-muted-foreground">City, ST 12345</div>
                      <div className="text-muted-foreground">United States</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                      <Clock className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Business Hours</div>
                      <div className="text-muted-foreground">Monday - Friday: 9am - 6pm</div>
                      <div className="text-muted-foreground">Saturday: 10am - 4pm</div>
                      <div className="text-muted-foreground">Sunday: Closed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="rounded-2xl overflow-hidden border border-border h-96 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Map Placeholder</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
