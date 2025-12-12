import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";

export default function TopBar() {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white shadow-lg relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-6 -left-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 py-2 z-10">
        {/* Left Content */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap text-center md:text-left">
          {/* Mobile: one line text + link together */}
          <p className="font-medium text-sm md:text-base leading-snug md:hidden">
            🚀 <span className="font-semibold">Grow your business</span> — list
            your products with us today!{" "}
            <Link
              to="/vendor/register"
              className="text-yellow-300 font-semibold hover:text-yellow-200 transition"
            >
              Register Now →
            </Link>
          </p>

          {/* Desktop: normal text */}
          <p className="hidden md:block font-medium text-base leading-snug">
            🚀 <span className="font-semibold">Grow your business</span> — list
            your products with us today!
          </p>
        </div>

        {/* Desktop Button */}
        <Link
          to="/vendor/register"
          className="hidden md:block bg-white/90 backdrop-blur-sm text-indigo-700 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-white hover:scale-105 transition-all duration-300"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}
