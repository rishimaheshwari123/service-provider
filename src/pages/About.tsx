import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import { Users, Target, Heart, Award, Rocket, Globe, Shield, Zap } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission Driven",
      description: "We're committed to helping businesses achieve their full potential through innovative solutions.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Our team is passionate about technology and dedicated to delivering excellence in every project.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe in the power of teamwork and building strong partnerships with our clients.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Quality is at the core of everything we do, from initial consultation to final delivery.",
    },
  ];

  const achievements = [
    { icon: Rocket, number: "1000+", label: "Projects Completed", color: "from-orange-500 to-rose-500" },
    { icon: Users, number: "500+", label: "Happy Clients", color: "from-rose-500 to-pink-500" },
    { icon: Globe, number: "25+", label: "Countries Served", color: "from-amber-500 to-orange-500" },
    { icon: Shield, number: "99.9%", label: "Uptime Guarantee", color: "from-emerald-500 to-teal-500" },
  ];

  const teamMembers = [
    { 
      name: "Rajesh Kumar", 
      role: "CEO & Founder",
      image: "/src/assets/hero-slide-1.jpg",
      description: "Visionary leader with 15+ years in tech industry"
    },
    { 
      name: "Priya Sharma", 
      role: "CTO",
      image: "/src/assets/hero-slide-2.jpg",
      description: "Technology expert specializing in scalable solutions"
    },
    { 
      name: "Amit Patel", 
      role: "Lead Designer",
      image: "/src/assets/hero-slide-3.jpg",
      description: "Creative designer with passion for user experience"
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

      <TopBar />
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="py-12 bg-gradient-to-br from-orange-50/80 via-white to-rose-50/80 relative overflow-hidden"
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
                About <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">HireExpert</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                We're on a mission to revolutionize how businesses connect with top talent and achieve extraordinary results through innovative solutions.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 relative"
        >
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                    Our Journey
                  </h2>
                  <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                    <p>
                      Founded in 2020, HireExpert emerged from a simple yet powerful idea: businesses deserve access to exceptional talent without the traditional barriers and complexities.
                    </p>
                    <p>
                      What started as a small team of passionate professionals has evolved into a leading platform, trusted by thousands of businesses worldwide to find, hire, and collaborate with top-tier service providers.
                    </p>
                    <p>
                      Today, we continue to innovate, breaking down barriers between talent and opportunity, and creating a future where exceptional work knows no boundaries.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="grid grid-cols-2 gap-6">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${achievement.color} flex items-center justify-center mb-4 shadow-lg`}>
                          <achievement.icon className="text-white" size={24} />
                        </div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${achievement.color} bg-clip-text text-transparent mb-2`}>
                          {achievement.number}
                        </div>
                        <div className="text-gray-600 text-sm font-medium">
                          {achievement.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-br from-rose-50/60 via-white to-orange-50/60 relative overflow-hidden"
        >
          <AnimatedBackground variant="particles" />
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600">
                These fundamental principles guide every decision we make and every relationship we build
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/40 relative"
        >
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Meet Our Leadership
              </h2>
              <p className="text-xl text-gray-600">
                The visionary minds driving innovation and excellence at HireExpert
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{member.name}</h3>
                    <p className="text-orange-600 font-semibold mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 relative overflow-hidden"
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
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of businesses that trust HireExpert to connect them with exceptional talent
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                Get Started Today
              </motion.button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
