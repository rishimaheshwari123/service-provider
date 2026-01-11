import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t } = useTranslation();

  return (
    // Dark Background for a premium finish
    <footer className="bg-gray-900 border-t border-gray-700 dark:bg-black text-gray-300">
      <div className="container mx-auto px-4 py-16">
        {/* Main Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 1. Brand & Description */}
          <div>
            {/* Using a custom logo/brand name with a gradient for visual appeal */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="ProServe Logo"
                  className="h-24 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-gray-400 text-base mb-6">
              {t(
                "footer.connectWithExperts",
                "Connect with verified experts instantly. Your project success is our top priority."
              )}
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61585232704468"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Facebook size={22} />
              </a>
              <a
                href="https://www.instagram.com/gharsansaar25/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Instagram size={22} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6 border-b border-primary/20 pb-2">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.jobs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Resources & Services */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6 border-b border-primary/20 pb-2">
              {t("footer.resources", "Resources")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/services"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.blogs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/customer-support"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("nav.support")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("footer.termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                  <ChevronRight size={16} className="mr-2 text-primary/70" />
                  {t("footer.privacyPolicy", "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact Information */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6 border-b border-primary/20 pb-2">
              {t("pages.contact.getInTouch")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-base hover:text-white transition-colors">
                <Mail size={18} className="text-primary/70 flex-shrink-0" />
                <a
                  href="mailto:solutions.niyati@gmail.com"
                  className="truncate"
                >
                  solutions.niyati@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-base hover:text-white transition-colors">
                <Phone size={18} className="text-primary/70 flex-shrink-0" />
                <a href="tel:+917879884363">+91 78798 84363</a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-base">
                <MapPin
                  size={18}
                  className="text-primary/70 flex-shrink-0 mt-1"
                />
                <span>104, RNT Complex Opp Excellence School Sagar</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Bottom Line */}
        <div className="border-t border-gray-700/50 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 {t("footer.allRightsReserved")}. </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
