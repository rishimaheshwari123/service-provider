import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Wrench, Zap, Home, ClipboardList, MessageCircle, HeadphonesIcon, Clock, CheckCircle, HelpCircle, Send } from "lucide-react";
import { createCustomerSupportAPI } from "@/service/operations/customerSupport";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import AnimatedBackground from "@/components/AnimatedBackground";

const CustomerSupport = () => {
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
      title: "Live Chat",
      description: "Chat with our support team instantly",
      availability: "24/7 Available",
      color: "from-orange-500 to-rose-500"
    },
    {
      icon: HeadphonesIcon,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Sat, 9 AM - 7 PM",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed inquiries",
      availability: "Response within 24 hours",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Browse our knowledge base",
      availability: "Self-service anytime",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const faqs = [
    {
      icon: Home,
      question: "How do I book a Home Cleaning service?",
      answer: "Navigate to the 'Book Services' page, select 'Home Cleaning', choose your preferred date/time and service package, then confirm your booking with payment."
    },
    {
      icon: Zap,
      question: "Can I hire an Electrician for emergency repairs?",
      answer: "Yes, we offer 'Emergency Service' options for critical repairs like electrical faults. Select the category and specify 'Emergency' in the job description for priority matching."
    },
    {
      icon: Wrench,
      question: "How can I reschedule or cancel a booking?",
      answer: "You can manage your bookings directly in your User Dashboard. Look for the 'My Bookings' section, where you'll find options to reschedule (up to 24 hours prior) or cancel."
    },
    {
      icon: ClipboardList,
      question: "Are there any hidden fees for services?",
      answer: "All service charges are clearly outlined on the booking page. The total price you see is what you pay. Any material costs are discussed and approved by you upfront."
    },
    {
      icon: CheckCircle,
      question: "How do I track my service request?",
      answer: "Once your booking is confirmed, you'll receive real-time updates via SMS and email. You can also track progress in your dashboard."
    },
    {
      icon: Clock,
      question: "What if the service provider is late?",
      answer: "If a service provider is running late, you'll be notified immediately. We offer compensation for delays beyond 30 minutes of the scheduled time."
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
                Customer <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">Support</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                We're here to help you with any questions or issues. Our dedicated support team is ready to assist you 24/7.
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
                How Can We Help You?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the support option that works best for you
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
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find quick answers to common questions about our services
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
                Still Need Help?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Send us a detailed message and our support team will get back to you within 24 hours
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
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 appearance-none cursor-pointer transition duration-200"
                    >
                      <option value="">Select a category</option>
                      <option value="home_cleaning">Home Cleaning Support</option>
                      <option value="hire_electrician">Electrician Services</option>
                      <option value="hire_plumber">Plumbing Services</option>
                      <option value="booking_issue">Booking Issues</option>
                      <option value="payment_billing">Payment & Billing</option>
                      <option value="technical_issue">Technical Issues</option>
                      <option value="general_feedback">General Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 bg-gray-50 resize-none"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <Send size={20} />
                  Send Support Request
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
                Need Immediate Assistance?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Email Support</h3>
                  <p className="opacity-90 mb-2">support@hireexpert.com</p>
                  <p className="text-sm opacity-75">Response within 24 hours</p>
                </div>
                <div className="text-center">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Phone Support</h3>
                  <p className="opacity-90 mb-2">+91 98765 43210</p>
                  <p className="text-sm opacity-75">Mon-Sat, 9 AM - 7 PM IST</p>
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
