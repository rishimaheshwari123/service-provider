import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactSection = () => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted!");
  };

  return (
    <section id="contact" className="py-5 md:py-10">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
            {t("pages.contact.getInTouch", "GET IN TOUCH")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("pages.home.needExpert", "Need Expert")}{" "}
            <span className="text-blue-600">
              {t("pages.home.assistance", "Assistance")}
            </span>
            ?
          </h2>
          <p className="text-gray-600">
            {t(
              "pages.home.haveQuestions",
              "Have questions about hiring or listing services? Reach out to our dedicated support team."
            )}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {t("pages.home.talkToTeam", "Talk to Our Team")}
            </h3>
            <p className="text-gray-600">
              {t(
                "pages.home.available24x7",
                "We're available 24/7 to answer your questions and guide you through the process."
              )}
            </p>

            {/* Information Cards */}
            <div className="space-y-4">
              {/* Email Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-white w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {t("pages.contact.emailUs", "Email Us")}
                  </div>
                  <a
                    href="mailto:solutions.niyati@gmail.com"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    solutions.niyati@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-white w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {t("pages.home.callAnytime", "Call Anytime")}
                  </div>
                  <a
                    href="tel:+917879884363"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    +91 78798 84363
                  </a>
                </div>
              </div>

              {/* Office Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {t("pages.home.visitOffice", "Visit Our Office")}
                  </div>
                  <div className="text-gray-600 text-sm">
                    104, RNT Complex Opp Excellence School Sagar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                {t("pages.contact.sendMessage", "Send Message")}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder={t("pages.home.yourFullName", "Your Full Name")}
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                    required
                  />
                  <Input
                    type="email"
                    placeholder={t("pages.home.yourBestEmail", "Your Best Email")}
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                    required
                  />
                </div>
                <Input
                  placeholder={t(
                    "pages.home.subjectInquiry",
                    "Subject / Service Inquiry"
                  )}
                  className="h-11 bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                  required
                />
                <Textarea
                  placeholder={t(
                    "pages.home.tellUsNeeds",
                    "Tell us about your needs..."
                  )}
                  className="bg-gray-50 border-gray-200 min-h-[140px] focus:border-blue-600 focus:ring-blue-600"
                  required
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {t("pages.contact.sendMessage", "Send Message")}
                  <Send className="w-4 h-4 ml-2" />
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
