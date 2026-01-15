import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Globe,
  Smartphone,
  Users,
  CheckCircle,
  Target,
  Eye,
  Heart,
  Shield,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const About = () => {
  const { t } = useTranslation();

  const offerings = [
    {
      icon: Globe,
      title: t("pages.about.singlePlatform"),
    },
    {
      icon: Smartphone,
      title: t("pages.about.easyDiscovery"),
    },
    {
      icon: Users,
      title: t("pages.about.verifiedProviders"),
    },
    {
      icon: CheckCircle,
      title: t("pages.about.transparentSelection"),
    },
  ];

  const whyGharSansaar = [
    {
      icon: Globe,
      title: t("pages.about.onePlatform"),
    },
    {
      icon: Smartphone,
      title: t("pages.about.userFriendly"),
    },
    {
      icon: Shield,
      title: t("pages.about.trustedPartners"),
    },
    {
      icon: Heart,
      title: t("pages.about.focusOnQuality"),
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-rose-50"
          animate={{
            background: [
              "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fef7ff 100%)",
              "linear-gradient(135deg, #fef7ff 0%, #ffffff 50%, #fff7ed 100%)",
              "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fef7ff 100%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="py-8 bg-gradient-to-br from-orange-50/80 via-white to-rose-50/80 relative overflow-hidden"
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
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                {t("pages.about.aboutTitle")}{" "}
                <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  GharSansaar
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {t("pages.about.missionStatement")}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* About Description Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-6 bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 relative"
        >
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-lg text-gray-600 leading-relaxed space-y-4"
              >
                <p>{t("pages.about.aboutDescription1")}</p>
                <p>{t("pages.about.aboutDescription2")}</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* What We Offer Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-8 bg-gradient-to-br from-rose-50/60 via-white to-orange-50/60 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {t("pages.about.whatWeOffer")}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {offerings.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-5 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <item.icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {item.title}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Mission & Vision Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-8 bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 relative"
        >
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="p-6 rounded-2xl bg-white shadow-lg border border-gray-100"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                  <Target className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  {t("pages.about.ourMission")}
                </h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  {t("pages.about.missionText")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-6 rounded-2xl bg-white shadow-lg border border-gray-100"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                  <Eye className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  {t("pages.about.ourVision")}
                </h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  {t("pages.about.visionText")}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Why GharSansaar Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-8 bg-gradient-to-br from-rose-50/60 via-white to-orange-50/60 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {t("pages.about.whyGharSansaar")}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {whyGharSansaar.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-5 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <item.icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {item.title}
                  </h3>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-4xl mx-auto text-center mt-6"
            >
              <p className="text-base text-gray-600 leading-relaxed">
                {t("pages.about.commitment")}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-10 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/50 to-rose-600/50"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center text-white"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t("pages.about.readyToTransform")}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {t("pages.about.joinThousands")}
              </p>
              <a href="/vendor/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  {t("pages.about.getStartedToday")}
                </motion.button>
              </a>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
