import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, Users, Award } from "lucide-react";
import hero4 from "@/assets/hero-slide-4.jpg";
import serviceSupport from "@/assets/service-support.jpg";
import success3 from "@/assets/success3.jpg";
const PortfolioShowcase = () => {
  const portfolioItems = [
    {
      id: 1,
      title: "Premium Plumbing Services Network",
      image: hero4,
      category: "Plumbing Services",
      vendor: "AquaFix Pro Solutions",
      experience: "8+ years",
      services: "50+ services",
      rating: 4.9,
      description:
        "Professional plumbing network with certified experts offering emergency repairs, installations, and maintenance services across the city.",
      specialties: [
        "Emergency Repairs",
        "Pipe Installation",
        "Leak Detection",
        "Bathroom Fitting",
      ],
      achievements: [
        "500+ satisfied customers",
        "24/7 emergency service",
        "Same-day service guarantee",
      ],
    },
    {
      id: 2,
      title: "Elite Housekeeping & Cleaning",
      image: serviceSupport,
      category: "Housekeeping Services",
      vendor: "CleanPro Experts",
      experience: "5+ years",
      services: "30+ services",
      rating: 4.8,
      description:
        "Comprehensive housekeeping services with trained professionals offering deep cleaning, regular maintenance, and specialized cleaning solutions.",
      specialties: [
        "Deep Cleaning",
        "Regular Maintenance",
        "Carpet Cleaning",
        "Kitchen Sanitization",
      ],
      achievements: [
        "1000+ homes serviced",
        "Eco-friendly products used",
        "Insured & background-verified staff",
      ],
    },
    {
      id: 3,
      title: "Expert Electrical Solutions Hub",
      image: success3,
      category: "Electrical Services",
      vendor: "PowerTech Electricians",
      experience: "10+ years",
      services: "40+ services",
      rating: 4.9,
      description:
        "Licensed electrical contractors providing residential and commercial electrical services with safety-first approach and modern solutions.",
      specialties: [
        "Wiring & Rewiring",
        "Smart Home Setup",
        "Panel Upgrades",
        "Emergency Repairs",
      ],
      achievements: [
        "Zero safety incidents",
        "Licensed & certified team",
        "Smart home specialists",
      ],
    },
  ];

  return (
    <section className="py-10 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            Featured Service Providers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our top-rated vendors who deliver exceptional services across
            multiple categories
          </p>
        </motion.div>

        {/* Portfolio Items */}
        <div className="space-y-12">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 items-center`}
            >
              {/* Image Section */}
              <div className="lg:w-1/2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative group overflow-hidden rounded-2xl shadow-2xl"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="lg:w-1/2 space-y-4">
                <div>
                  <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-3">
                    {item.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <p className="text-sm font-medium text-orange-600">
                    Vendor: {item.vendor}
                  </p>
                </div>

                {/* Vendor Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white rounded-xl shadow-md">
                    <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Experience</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {item.experience}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl shadow-md">
                    <Users className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Services</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {item.services}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl shadow-md">
                    <Star className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="font-bold text-gray-900 flex items-center justify-center text-sm">
                      {item.rating}
                      <Star className="w-3 h-3 text-yellow-400 ml-1 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Specialties:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.specialties.map((specialty, specialtyIndex) => (
                      <span
                        key={specialtyIndex}
                        className="px-3 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Key Achievements:
                  </h4>
                  <ul className="space-y-1">
                    {item.achievements.map((achievement, achievementIndex) => (
                      <li
                        key={achievementIndex}
                        className="flex items-center text-gray-600 text-sm"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mr-2"></div>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View Vendor Profile
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-10 p-6 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Want to Join Our Service Provider Network?
          </h3>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Register your business and connect with thousands of customers
            looking for quality services
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Register as Vendor
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioShowcase;
