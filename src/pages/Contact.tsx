import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HeadphonesIcon,
  Globe,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const Contact = () => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const contactMethods = [
    {
      icon: Mail,
      title: t("pages.contact.emailUs"),
      description: t("pages.contact.sendEmailAnytime"),
      details: ["solutions.niyati@gmail.com"],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Phone,
      title: t("pages.contact.callUs"),
      description: t("pages.contact.speakWithTeam"),
      details: ["+91 78798 84363"],
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: MapPin,
      title: t("pages.contact.visitUs"),
      description: t("pages.contact.comeToOffice"),
      details: ["104, RNT Complex Opp Excellence School Sagar", "India"],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Clock,
      title: t("pages.contact.businessHours"),
      description: t("pages.contact.weAreAvailable"),
      details: [
        "Mon - Fri: 9:00 AM - 7:00 PM",
        "Sat: 10:00 AM - 4:00 PM",
        "Sun: Closed",
      ],
      color: "from-blue-600 to-blue-700",
    },
  ];

  const quickActions = [
    {
      icon: MessageCircle,
      title: t("pages.support.livechat"),
      description: t("pages.contact.chatWithSupport"),
    },
    {
      icon: HeadphonesIcon,
      title: t("pages.contact.scheduleCall"),
      description: t("pages.contact.bookConsultation"),
    },
    {
      icon: Globe,
      title: t("pages.support.helpCenter"),
      description: t("pages.contact.browseKnowledge"),
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"
          animate={{
            background: [
              "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eff6ff 100%)",
              "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eff6ff 100%)",
              "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eff6ff 100%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* <TopBar /> */}
      <Navbar />

      <main className="relative z-10 pt-2">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="py-12 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 relative overflow-hidden"
        >
          <AnimatedBackground variant="dots" />
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                {t("pages.contact.getInTouch")}{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"></span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {t("pages.contact.heroDescription")}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-10 bg-gradient-to-r from-white via-blue-50/30 to-blue-50/30 relative"
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {action.title}
                  </h3>
                  <p className="text-gray-600">{action.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact Form & Info */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-br from-white via-blue-50/30 to-blue-50/30 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {t("pages.contact.sendMessage")}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        {t("pages.contact.firstName")} *
                      </label>
                      <Input
                        placeholder="John"
                        className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl h-12"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        {t("pages.contact.lastName")} *
                      </label>
                      <Input
                        placeholder="Doe"
                        className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {t("pages.signup.email")} *
                    </label>
                    <Input
                      type="email"
                      placeholder={t("forms.placeholders.enterEmail")}
                      className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl h-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {t("pages.contact.phone")}
                    </label>
                    <Input
                      type="tel"
                      placeholder={t("forms.placeholders.enterPhone")}
                      className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {t("pages.contact.subject")} *
                    </label>
                    <Input
                      placeholder={t("pages.contact.howCanWeHelp")}
                      className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl h-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {t("pages.contact.message")} *
                    </label>
                    <Textarea
                      placeholder={t("forms.placeholders.enterMessage")}
                      className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl min-h-[150px] resize-none"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    {t("pages.contact.sendNow")}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {t("pages.contact.letsConnect")}
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {t("pages.contact.connectDescription")}
                </p>

                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start gap-4 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <method.icon className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-lg mb-1 text-gray-900">
                          {method.title}
                        </div>
                        <div className="text-gray-600 mb-2">
                          {method.description}
                        </div>
                        {method.details.map((detail, detailIndex) => (
                          <div
                            key={detailIndex}
                            className="text-gray-700 font-medium"
                          >
                            {detail}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative"
        >
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {t("pages.contact.findOffice")}
              </h2>
              <p className="text-xl text-gray-600">
                {t("pages.contact.visitHeadquarters")}
              </p>
            </motion.div>
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden border border-gray-200 h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-2xl"
              >
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Interactive Map
                  </p>
                  <p className="text-gray-600">
                    Coming Soon - Google Maps Integration
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
