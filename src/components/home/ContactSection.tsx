import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactSection = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section id="contact" className="pt-0 pb-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Need <span className="gradient-text">Help?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Have questions? Our team is here to help you find the right service
            provider
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary-foreground" size={20} />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email</div>
                    <div className="text-muted-foreground">
                      support@email.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary-foreground" size={20} />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Phone</div>
                    <div className="text-muted-foreground">+91 1234567890</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary-foreground" size={20} />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Office</div>
                    <div className="text-muted-foreground">
                      123 Business Street, City, ST 12345
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  placeholder="Your Name"
                  className="bg-card border-border"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="bg-card border-border"
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Subject"
                  className="bg-card border-border"
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  className="bg-card border-border min-h-[150px]"
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
