import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassMorphismProps {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark" | "colored";
}

const GlassMorphism = ({ children, className = "", variant = "light" }: GlassMorphismProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "dark":
        return "bg-gray-900/20 border-gray-700/30 backdrop-blur-xl";
      case "colored":
        return "bg-gradient-to-br from-orange-500/10 to-rose-500/10 border-orange-300/20 backdrop-blur-xl";
      default:
        return "bg-white/20 border-white/30 backdrop-blur-xl";
    }
  };

  return (
    <motion.div
      className={`
        ${getVariantStyles()}
        border rounded-2xl shadow-2xl
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassMorphism;