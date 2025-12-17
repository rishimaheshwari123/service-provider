import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Gift, Star, Zap } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "promotion";
  icon?: React.ReactNode;
}

const NotificationToast = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sampleNotifications: Notification[] = [
    {
      id: "1",
      title: "Welcome Offer!",
      message: "Get 20% off on your first booking",
      type: "promotion",
      icon: <Gift className="w-5 h-5" />
    },
    {
      id: "2", 
      title: "New Features",
      message: "Check out our latest property filters",
      type: "info",
      icon: <Star className="w-5 h-5" />
    },
    {
      id: "3",
      title: "Limited Time",
      message: "Premium listings now available",
      type: "success",
      icon: <Zap className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([sampleNotifications[0]]);
    }, 3000);

    const timer2 = setTimeout(() => {
      setNotifications(prev => [...prev, sampleNotifications[1]]);
    }, 8000);

    const timer3 = setTimeout(() => {
      setNotifications(prev => [...prev, sampleNotifications[2]]);
    }, 13000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400";
      case "promotion":
        return "bg-gradient-to-r from-rose-500 to-pink-500 border-rose-400";
      default:
        return "bg-gradient-to-r from-orange-500 to-rose-500 border-orange-400";
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`${getNotificationStyles(notification.type)} text-white p-4 rounded-lg shadow-lg border backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.icon || <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Auto-dismiss progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
              onAnimationComplete={() => removeNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;