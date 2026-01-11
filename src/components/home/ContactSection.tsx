import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send } from "lucide-react";

// Assuming gradient-primary class provides a background gradient

const ContactSection = () => {
  const { t } = useTranslation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle form submission (e.g., API call)
    console.log("Form Submitted!");
    // You would typically show a success toast/message here
  };

  return (
    // Light background for a clean, professional look
    <section id="contact" className="py-5 md:py-10">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
            {t('pages.contact.getInTouch')}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('pages.home.needExpert')} <span className="gradient-text">{t('pages.home.assistance')}</span>?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('pages.home.haveQuestions')}
          </p>
        </div>

        {/* Main Grid Layout: 1/3 Contact Info | 2/3 Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto">
          
          {/* 1. Contact Information (Left Column - 1/3) */}
          <div className="lg:col-span-1 space-y-8 animate-fade-in">
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('pages.home.talkToTeam')}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('pages.home.available24x7')}
            </p>

            {/* Information Cards */}
            <div className="space-y-4">
              
              {/* Email Card */}
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-0.5 text-gray-900 dark:text-white">{t('pages.contact.emailUs')}</div>
                  <a href="mailto:solutions.niyati@gmail.com" className="text-primary hover:text-blue-600 transition-colors font-medium">
                    solutions.niyati@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-0.5 text-gray-900 dark:text-white">{t('pages.home.callAnytime')}</div>
                  <a href="tel:+917879884363" className="text-primary hover:text-blue-600 transition-colors font-medium">
                    +91 78798 84363
                  </a>
                </div>
              </div>

              {/* Office Card */}
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-0.5 text-gray-900 dark:text-white">{t('pages.home.visitOffice')}</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    104, RNT Complex Opp Excellence School Sagar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Contact Form (Right Column - 2/3) */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    {t('pages.contact.sendMessage')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                            placeholder={t('pages.home.yourFullName')}
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary"
                            required
                        />
                        <Input
                            type="email"
                            placeholder={t('pages.home.yourBestEmail')}
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <Input
                            placeholder={t('pages.home.subjectInquiry')}
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <Textarea
                            placeholder={t('pages.home.tellUsNeeds')}
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
                        {t('pages.contact.sendMessage')}
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