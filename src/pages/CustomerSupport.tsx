import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Wrench, Zap, Home, ClipboardList, MessageCircle, HeadphonesIcon, Clock, CheckCircle, HelpCircle, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createCustomerSupportAPI } from "@/service/operations/customerSupport";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import AnimatedBackground from "@/components/AnimatedBackground";

const CustomerSupport = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await createCustomerSupportAPI(formData);
    if (response?.success) {
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
      alert("Your service inquiry has been submitted successfully!");
    } else {
      alert("Failed to submit inquiry. Please try again.");
    }
  };

  const supportOptions = [
    {
      icon: MessageCircle,
      title: t('support.liveChat'),
      description: t('support.liveChatDesc'),
      availability: t('support.available247'),
      color: "from-orange-500 to-rose-500"
    },
    {
      icon: HeadphonesIcon,
      title: t('support.phoneSupport'),
      description: t('support.phoneSupportDesc'),
      availability: t('support.monSat'),
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Mail,
      title: t('support.emailSupport'),
      description: t('support.emailSupportDesc'),
      availability: t('support.responseWithin24'),
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: HelpCircle,
      title: t('support.helpCenter'),
      description: t('support.helpCenterDesc'),
      availability: t('support.selfService'),
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const faqs = [
    {
      icon: Home,
      question: t('support.faqBookHomeCleaning'),
      answer: t('support.faqBookHomeCleaningAnswer')
    },
    {
      icon: Zap,
      question: t('support.faqEmergencyElectrician'),
      answer: t('support.faqEmergencyElectricianAnswer')
    },
    {
      icon: Wrench,
      question: t('support.faqReschedule'),
      answer: t('support.faqRescheduleAnswer')
    },
    {
      icon: ClipboardList,
      question: t('support.faqHiddenFees'),
      answer: t('support.faqHiddenFeesAnswer')
    },
    {
      icon: CheckCircle,
      question: t('support.faqTrackRequest'),
      answer: t('support.faqTrackRequestAnswer')
    },
    {
      icon: Clock,
      question: t('support.faqProviderLate'),
      answer: t('support.faqProviderLateAnswer')
    }
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

      <TopBar />
      <Navbar />

      <main className="relative z-10 pt-5">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="py-5 bg-gradient-to-br from-orange-50/80 via-white to-rose-50/80 relative overflow-hidden"
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
                {t('support.customerSupport').split(' ')[0]} <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">{t('support.customerSupport').split(' ').slice(1).join(' ') || 'Support'}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {t('support.supportSubtitle')}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Support Options */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-10 bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 relative"
        >
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {t('support.howCanWeHelp')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('support.chooseOption')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {supportOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${option.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <option.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    {option.availability}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-10 bg-gradient-to-br from-rose-50/60 via-white to-orange-50/60 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {t('support.faq')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('support.faqSubtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <faq.icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-10 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/40 relative"
        >
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {t('support.stillNeedHelp')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('support.stillNeedHelpDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      {t('support.yourName')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50"
                      placeholder={t('forms.placeholders.enterName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      {t('support.yourEmail')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50"
                      placeholder={t('forms.placeholders.enterEmail')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      {t('support.subject')} *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50"
                      placeholder={t('forms.placeholders.howCanWeHelp')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      {t('support.category')} *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 appearance-none cursor-pointer transition duration-200"
                    >
                      <option value="">{t('support.selectCategory')}</option>
                      <option value="home_cleaning">{t('support.homeCleaningSupport')}</option>
                      <option value="hire_electrician">{t('support.electricianServices')}</option>
                      <option value="hire_plumber">{t('support.plumbingServices')}</option>
                      <option value="booking_issue">{t('support.bookingIssues')}</option>
                      <option value="payment_billing">{t('support.paymentBilling')}</option>
                      <option value="technical_issue">{t('support.technicalIssues')}</option>
                      <option value="general_feedback">{t('support.generalFeedback')}</option>
                      <option value="other">{t('support.other')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    {t('support.yourMessage')} *
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50 resize-none"
                    placeholder={t('forms.placeholders.describeIssue')}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <Send size={20} />
                  {t('support.sendSupportRequest')}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Info Section */}
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
              className="text-center text-white"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                {t('support.needImmediateAssistance')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">{t('support.emailSupportTitle')}</h3>
                  <p className="opacity-90 mb-2">support@hireexpert.com</p>
                  <p className="text-sm opacity-75">{t('support.responseWithin24')}</p>
                </div>
                <div className="text-center">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">{t('support.phoneSupportTitle')}</h3>
                  <p className="opacity-90 mb-2">+91 78798 84363</p>
                  <p className="text-sm opacity-75">{t('support.monSat')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerSupport;
