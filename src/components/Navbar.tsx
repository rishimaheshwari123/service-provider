import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  MapPin,
  Loader2,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Store,
  LayoutDashboard,
  Home,
  Info,
  Mail,
  Briefcase,
  Layers, // For Blogs/Services Link
  BarChart3,
  HardHat, // For Jobs
  LifeBuoy, // For Support
  FileText, // For Terms
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "@/assets/logo.png";
// Updated menu links with icons for a clean look
const menuLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "Services", href: "/services", icon: Briefcase, hot: true },
  { label: "Blogs", href: "/blogs", icon: Layers },
  { label: "Polls", href: "/polls", icon: BarChart3 },
  { label: "Jobs", href: "/careers", icon: HardHat },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Support", href: "/customer-support", icon: LifeBuoy },
];

const Navbar = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Updated menu links with translations
  const menuLinks = [
    { label: t("nav.home"), href: "/", icon: Home },
    { label: t("nav.about"), href: "/about", icon: Info },
    { label: t("nav.services"), href: "/services", icon: Briefcase },
    { label: t("nav.blogs"), href: "/blogs", icon: Layers },
    { label: t("nav.jobs"), href: "/careers", icon: HardHat },
    { label: t("nav.contact"), href: "/contact", icon: Mail },
    { label: t("nav.support"), href: "/customer-support", icon: LifeBuoy },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success(t("messages.loggedOut"));
    navigate("/");
  };

  // --- Location Detection Logic (Keeping it clean) ---
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCurrentLocation(t("nav.locationNotAvailable"));
      toast.error(t("messages.geolocationNotSupported"));
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          setCurrentLocation(
            data.address.city ||
              data.address.town ||
              data.address.village ||
              "Unknown"
          );
        } catch (err) {
          console.error(err);
          setCurrentLocation("Unknown");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        // User denied access
        if (error.code === 1) {
          setCurrentLocation(t("nav.locationNotAvailable"));
          toast.error(t("messages.locationDenied"));
        } else if (error.code === 2) {
          setCurrentLocation("Location unavailable");
          toast.error(t("messages.locationUnavailable"));
        } else if (error.code === 3) {
          setCurrentLocation("Location timed out");
          toast.error(t("messages.locationTimeout"));
        }
        setIsLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-md font-sans sticky top-0 z-50">
      <div className="w-11/12 mx-auto px-1 md:px-0 py-3">
        <div className="flex items-center justify-between h-16">
          {/* 1. Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="ProServe Logo"
                className="h-20 w-auto object-contain"
              />
            </Link>
          </div>

          {/* 2. Navigation - Desktop */}
          <nav className="hidden xl:flex items-center space-x-7">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                // Custom Hover Effect: Underline lift and color change
                className="relative text-gray-700 dark:text-gray-300 font-medium text-sm py-2 transition-all group hover:text-primary"
              >
                {link.label}
                {/* Visual Underline Effect */}
                <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300"></span>
                {link.hot && (
                  <span className="bg-red-500 text-white px-1.5 py-0.1 rounded-full text-[9px] font-bold ml-1 absolute -top-2 right-[-22px]">
                    {t("common.new")}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* 3. Right Section */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Current Location & Contact Info */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Location */}
              <button
                onClick={getCurrentLocation}
                className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isLoadingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <MapPin className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentLocation || t("nav.detectLocation")}
                </span>
              </button>

              {/* Call Number */}
              <a
                href="tel:+917879884363"
                className="flex items-center space-x-2 text-primary font-semibold text-sm hover:underline"
              >
                <Phone className="h-4 w-4" />
                <span>+91 78798 84363</span>
              </a>
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {user && token ? (
                // Logged in user dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-2 rounded-full bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 transition-colors border border-primary/20">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarImage src={user.profileImage?.url} />
                      <AvatarFallback className="bg-primary text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* <span className="font-semibold text-gray-800 dark:text-white hidden sm:inline">
                      {user.name?.split(" ")[0]}
                    </span> */}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="px-3 py-2 border-b dark:border-gray-700">
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>

                    {/* Dashboard Links */}
                    {[
                      {
                        role: "vendor",
                        href: "/vendor/dashboard",
                        label: t("dashboard.vendor"),
                        icon: Store,
                        color: "text-green-500",
                      },
                      {
                        role: "admin",
                        href: "/admin/dashboard",
                        label: t("dashboard.admin"),
                        icon: Shield,
                        color: "text-red-500",
                      },
                      {
                        role: "super_admin",
                        href: "/admin/dashboard",
                        label: t("dashboard.superAdmin"),
                        icon: Shield,
                        color: "text-red-600",
                      },
                    ].map(
                      (item) =>
                        user.role === item.role && (
                          <DropdownMenuItem
                            key={item.role}
                            asChild
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Link
                              to={item.href}
                              className="flex items-center space-x-2 font-medium"
                            >
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                              <span>{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        )
                    )}

                    <DropdownMenuItem
                      asChild
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Link
                        to={user.role === "vendor" ? "/vendor/my-profile" : "/user/profile"}
                        className="flex items-center space-x-2 font-medium"
                      >
                        <User className="h-4 w-4 text-primary" />
                        <span>{t("nav.profile")}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-500 font-medium cursor-pointer hover:bg-red-50 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Not logged in - CTA Button/Dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary text-white transition-all font-semibold hover:bg-blue-600 shadow-md shadow-primary/30">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{t("nav.login")}</span>
                    <ChevronDown className="h-4 w-4 hidden sm:inline" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Link
                        to="/login"
                        className="flex items-center space-x-3 p-2"
                      >
                        <User className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-bold">{t("nav.customerLogin")}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("nav.hireProf")}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Link
                        to="/partner/login"
                        className="flex items-center space-x-3 p-2"
                      >
                        <Store className="h-5 w-5 text-green-600" />
                        <div className="text-left">
                          <p className="font-bold">{t("nav.partnerLogin")}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("nav.listServices")}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Link
                        to="/signup"
                        className="flex items-center justify-center bg-primary/10 text-primary rounded-lg py-2 font-semibold"
                      >
                        {t("nav.createAccount")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Hamburger menu - Mobile only */}
            <div className="xl:hidden">
              <button
                onClick={toggleSidebar}
                className="text-gray-700 dark:text-gray-300 hover:text-primary p-2 rounded-full transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Darker, cleaner theme */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-gray-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } xl:hidden z-50 overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <Link to="/" onClick={toggleSidebar}>
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white p-2 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col p-5 space-y-2">
          {menuLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={toggleSidebar}
                className="flex items-center space-x-4 p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors font-medium text-lg"
              >
                <Icon className="h-6 w-6" />
                <span>{link.label}</span>
                {link.hot && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold ml-auto">
                    {t("common.new")}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Auth/Action Section */}
        <div className="p-5 mt-4 space-y-4 border-t border-gray-700">
          {/* Call Number - Mobile */}
          <a
            href="tel:+917879884363"
            className="flex items-center justify-center space-x-2 text-primary font-bold text-lg p-3 rounded-lg border border-primary/50 hover:bg-primary/10 transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span>{t("nav.callSupport")}</span>
          </a>

          {/* Mobile Auth Button */}
          {user && token ? (
            // Logged in user mobile CTA
            <button
              onClick={() => {
                handleLogout();
                toggleSidebar();
              }}
              className="flex items-center justify-center space-x-3 w-full p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow-lg"
            >
              <LogOut className="h-5 w-5" />
              <span>{t("nav.signOut")}</span>
            </button>
          ) : (
            // Not logged in mobile CTA
            <Link
              to="/login"
              onClick={toggleSidebar}
              className="flex items-center justify-center space-x-3 w-full p-3 rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors font-semibold shadow-lg"
            >
              <User className="h-5 w-5" />
              <span>{t("nav.customerLogin")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 xl:hidden z-40"
          onClick={toggleSidebar}
        />
      )}
    </header>
  );
};

export default Navbar;
