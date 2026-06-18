import { motion } from "framer-motion";

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8 p-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <motion.div 
          className="h-8 bg-gradient-to-r from-orange-200 via-rose-300 to-orange-200 rounded-lg"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 100%" }}
        />
        <motion.div 
          className="h-4 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 rounded w-3/4"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.2 }}
          style={{ backgroundSize: "200% 100%" }}
        />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 space-y-4"
          >
            <motion.div 
              className="h-32 bg-gradient-to-r from-orange-200 via-rose-300 to-orange-200 rounded"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
              style={{ backgroundSize: "200% 100%" }}
            />
            <div className="space-y-2">
              <motion.div 
                className="h-4 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 rounded"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.15 }}
                style={{ backgroundSize: "200% 100%" }}
              />
              <motion.div 
                className="h-4 bg-gradient-to-r from-rose-200 via-pink-300 to-rose-200 rounded w-2/3"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;