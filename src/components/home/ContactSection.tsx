import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

// Assuming gradient-primary class provides a background gradient

const ContactSection = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle form submission (e.g., API call)
    console.log("Form Submitted!");
    // You would typically show a success toast/message here
  };

  return (
    // Light background for a clean, professional look
    <section id="contact" className="py-24 md:py-36 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
            GET IN TOUCH
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Need <span className="gradient-text">Expert Assistance</span>?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Have questions about hiring or listing services? Reach out to our dedicated support team.
          </p>
        </div>

        {/* Main Grid Layout: 1/3 Contact Info | 2/3 Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto">
          
          {/* 1. Contact Information (Left Column - 1/3) */}
          <div className="lg:col-span-1 space-y-8 animate-fade-in">
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Talk to Our Team
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We're available 24/7 to answer your questions and guide you through the process.
            </p>

            {/* Information Cards */}
            <div className="space-y-4">
              
              {/* Email Card */}
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-0.5 text-gray-900 dark:text-white">Email Us</div>
                  <a href="mailto:support@email.com" className="text-primary hover:text-blue-600 transition-colors font-medium">
                    support@email.com
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-0.5 text-gray-900 dark:text-white">Call Anytime</div>
                  <a href="tel:+911234567890" className="text-primary hover:text-blue-600 transition-colors font-medium">
                    +91 1234567890
                  </a>
                </div>
              </div>

              {/* Office Card */}
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-0.5 text-gray-900 dark:text-white">Visit Our Office</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    123 Business Street, City, ST 12345
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Contact Form (Right Column - 2/3) */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    Send Us a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                            placeholder="Your Full Name"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary"
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Your Best Email"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Subject / Service Inquiry"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <Textarea
                            placeholder="Tell us about your needs..."
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[180px] focus:ring-primary"
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        variant="default" 
                        size="lg" 
                        className="w-full h-12 group text-lg font-bold bg-primary hover:bg-blue-600 shadow-xl shadow-primary/30"
                    >
                        Send Message
                        <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;