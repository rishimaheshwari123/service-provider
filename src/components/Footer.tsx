import { Link } from "react-router-dom";
import { 
    Mail, 
    Phone, 
    MapPin, 
    Facebook, 
    Twitter, 
    Linkedin, 
    ChevronRight 
} from "lucide-react";

const Footer = () => {
  return (
    // Dark Background for a premium finish
    <footer className="bg-gray-900 border-t border-gray-700 dark:bg-black text-gray-300">
      <div className="container mx-auto px-4 py-16">
        
        {/* Main Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* 1. Brand & Description */}
          <div>
            {/* Using a custom logo/brand name with a gradient for visual appeal */}
            <h3 className="text-3xl font-extrabold gradient-text mb-4 tracking-tight">
              ProServe
            </h3>
            <p className="text-gray-400 text-base mb-6">
              Connect with verified experts instantly. Your project success is our top priority.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-500 transition-colors">
                    <Facebook size={22} />
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Twitter size={22} />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-blue-700 transition-colors">
                    <Linkedin size={22} />
                </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6 border-b border-primary/20 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Resources & Services */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6 border-b border-primary/20 pb-2">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/services"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Our Services
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Blog & News
                </Link>
              </li>
              <li>
                <Link
                  to="/customer-support"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Customer Support
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="flex items-center text-gray-400 hover:text-primary transition-colors text-base"
                >
                    <ChevronRight size={16} className="mr-2 text-primary/70" />
                    Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact Information */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6 border-b border-primary/20 pb-2">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-base hover:text-white transition-colors">
                <Mail size={18} className="text-primary/70 flex-shrink-0" />
                <a href="mailto:contact@email.com" className="truncate">contact@email.com</a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-base hover:text-white transition-colors">
                <Phone size={18} className="text-primary/70 flex-shrink-0" />
                <a href="tel:+911234567890">+91 1234567890</a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-base">
                <MapPin size={18} className="text-primary/70 flex-shrink-0 mt-1" />
                <span>123 Business Street, Tech City, ST 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Bottom Line */}
        <div className="border-t border-gray-700/50 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 ProServe. All rights reserved. | Built with ❤️ for Modern Web</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;