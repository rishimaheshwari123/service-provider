import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowRight, Star } from "lucide-react";

export default function TopBar() {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-4 -left-8 w-20 h-20 bg-white/20 rounded-full blur-xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 right-0 w-28 h-28 bg-orange-300/20 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300/20 rounded-full blur-lg"
        />
      </div>

      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 py-3 z-10">
        {/* Left Content */}
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap text-center md:text-left">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>
          
          {/* Mobile: compact text */}
          <p className="font-medium text-sm md:text-base leading-snug md:hidden">
            <span className="font-bold">{t('pages.home.join1000Providers')}!</span> {t('pages.home.startEarningToday')}.{" "}
            <Link
              to="/vendor/register"
              className="text-yellow-200 font-bold hover:text-yellow-100 transition-colors underline decoration-2 underline-offset-2"
            >
              {t('pages.home.registerFree')} →
            </Link>
          </p>

          {/* Desktop: full text */}
          <p className="hidden md:block font-medium text-base leading-snug">
            <span className="font-bold">🎯 {t('pages.home.join1000Providers')}!</span> {t('pages.home.listServicesEarn')}.
          </p>
          
          <div className="hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-300 fill-current" />
            <span className="text-sm font-semibold">{t('pages.home.rating48')}</span>
          </div>
        </div>

        {/* Desktop Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block"
        >
          <Link
            to="/vendor/register"
            className="group flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-orange-50"
          >
            <span>{t('pages.home.registerFree')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Subtle bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.div>
  );
}
