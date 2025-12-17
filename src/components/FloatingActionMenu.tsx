import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, Mail, MapPin, Plus, X } from "lucide-react";

const FloatingActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: MessageCircle, label: "Chat", color: "bg-gradient-to-r from-orange-500 to-rose-500", href: "#contact" },
    { icon: Phone, label: "Call", color: "bg-gradient-to-r from-emerald-500 to-teal-500", href: "tel:+1234567890" },
    { icon: Mail, label: "Email", color: "bg-gradient-to-r from-rose-500 to-pink-500", href: "mailto:info@example.com" },
    { icon: MapPin, label: "Location", color: "bg-gradient-to-r from-amber-500 to-orange-500", href: "#location" },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-0 space-y-3"
          >
            {menuItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, x: -50, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -50, 
                  scale: 0,
                  transition: { delay: (menuItems.length - index) * 0.05 }
                }}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`${item.color} text-white p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center group border border-white/20`}
              >
                <item.icon className="w-5 h-5" />
              <span className="ml-3 text-white group-hover:translate-x-1 transition-transform duration-300 whitespace-nowrap">
  {item.label}
</span>

              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-gradient-to-r from-orange-500 to-rose-500 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionMenu;