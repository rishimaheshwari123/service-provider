import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Twitch,
  Phone,
  MapPin,
  Loader2,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Shield,
  Store,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
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

const menuLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Services", href: "/services", hot: true },
  { label: "Blogs", href: "/blogs" },
  { label: "Jobs", href: "/careers" },
  { label: "Support", href: "/customer-support" },
];

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Get current location using geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get city name
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyASz6Gqa5Oa3WialPx7Z6ebZTj02Liw-Gk`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            // Extract city name from address components
            const addressComponents = data.results[0].address_components;
            const city = addressComponents.find(
              (component: any) =>
                component.types.includes("locality") ||
                component.types.includes("administrative_area_level_2")
            );

            if (city) {
              setCurrentLocation(city.long_name);
              toast.success(`Location detected: ${city.long_name}`);
            } else {
              setCurrentLocation("Location detected");
              toast.success("Location detected successfully");
            }
          }
        } catch (error) {
          // Silently handle geocoding error
          setCurrentLocation("Location detected");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied by user.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  };

  // Auto-detect location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
<header className="bg-background border-b border-border shadow-sm font-sans relative z-50">
      <div className="w-11/12 mx-auto px-1 md:px-0 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              {/* <img
                src="/logo.png"
                alt="Logo"
                className=" h-10 md:h-12 object-contain cursor-pointer transition-transform hover:scale-105"
              /> */}
              <h3 className="text-xl font-bold gradient-text ">Logo</h3>{" "}
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuLinks.map((link) => (
              <div key={link.label} className="flex items-center space-x-2">
                <a
                  href={link.href}
                  className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
                >
                  {link.label}
                </a>
                {link.hot && (
                  <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                    Hot
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Current Location */}
            <div className="hidden md:flex items-center space-x-2 text-gray-600">
              {isLoadingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Detecting location...</span>
                </>
              ) : currentLocation ? (
                <>
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{currentLocation}</span>
                  <button
                    onClick={getCurrentLocation}
                    className="text-xs text-purple-600 hover:underline ml-1"
                  >
                    Update
                  </button>
                </>
              ) : (
                <button
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-1 text-sm text-purple-600 hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Detect Location</span>
                </button>
              )}
            </div>

            {/* Call Number */}
            <div className="hidden lg:flex items-center space-x-2 text-purple-600 font-semibold">
              <Phone className="h-5 w-5" />
              <span>+91 1234567890</span>
            </div>

            {/* Hamburger menu - Mobile only */}
            <div className="md:hidden">
              <button
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-purple-600 p-2 rounded-full transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {user && token ? (
                // Logged in user dropdown with dashboard access
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-2 rounded-full border border-purple-600 hover:bg-purple-50 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage?.url} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    {/* Dashboard Links based on user role */}
                    {/* {user.role === "user" && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/user/profile"
                          className="flex items-center space-x-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )} */}

                    {user.role === "vendor" && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/vendor/dashboard"
                          className="flex items-center space-x-2"
                        >
                          <Store className="h-4 w-4" />
                          <span>Vendor Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {(user.role === "admin" || user.role === "super_admin") && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-2"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link
                        to="/user/profile"
                        className="flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Not logged in - smart login dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary text-white transition-all font-semibold">
                    <span>Login</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="font-medium">User Login</p>
                          <p className="text-xs text-gray-500 hover:text-white">
                            For customers
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to="/partner/login"
                        className="flex items-center  hover:text-white space-x-2"
                      >
                        <Store className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">Partner Login</p>
                          <p className="text-xs text-gray-500  hover:text-white">
                            For business owners
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem asChild>
                      <Link to="/login" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Admin Login</p>
                          <p className="text-xs text-gray-500">
                            For administrators
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
  className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
    isSidebarOpen ? "translate-x-0" : "translate-x-full"
  } md:hidden z-50 overflow-y-auto`}
>

        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 object-contain cursor-pointer transition-transform hover:scale-105"
              />
            </Link>
          </div>{" "}
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-purple-600 p-2 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-4">
          {menuLinks.map((link) => (
            <div key={link.label} className="flex items-center space-x-2">
              <a
                href={link.href}
                className="text-gray-800 hover:text-purple-600 transition-colors font-medium text-lg"
              >
                {link.label}
              </a>
              {link.hot && (
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                  Hot
                </span>
              )}
            </div>
          ))}

          {/* Call Number - Mobile */}
          <div className="flex items-center space-x-2 text-purple-600 font-semibold mt-4">
            <Phone className="h-5 w-5" />
            <span>+91 1234567890</span>
          </div>

          {/* Mobile Auth Section */}
          <div className="mt-6 space-y-3">
            {user && token ? (
              // Logged in user section with dashboard access
              <>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profileImage?.url} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-purple-600 font-medium capitalize">
                      {user.role} Account
                    </p>
                  </div>
                </div>

                {/* Dashboard Link based on role */}
                {user.role === "user" && (
                  <Link
                    to={"/user/profile"}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                    onClick={toggleSidebar}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </Link>
                )}

                {user.role === "vendor" && (
                  <Link
                    to={"/vendor/dashboard"}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                    onClick={toggleSidebar}
                  >
                    <Store className="h-4 w-4" />
                    <span>Vendor Dashboard</span>
                  </Link>
                )}

                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link
                    to={"/admin/dashboard"}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all font-semibold"
                    onClick={toggleSidebar}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  to={"/user/profile"}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-full text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white transition-colors font-semibold"
                  onClick={toggleSidebar}
                >
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    toggleSidebar();
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-full text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Not logged in - smart login options
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Choose Login Type
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select your account type to continue
                  </p>
                </div>

                <Link
                  to={"/login"}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                  onClick={toggleSidebar}
                >
                  <User className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">User Login</p>
                    <p className="text-xs opacity-90">For customers & users</p>
                  </div>
                </Link>

                <Link
                  to={"/partner/login"}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                  onClick={toggleSidebar}
                >
                  <Store className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Partner Login</p>
                    <p className="text-xs opacity-90">For business owners</p>
                  </div>
                </Link>

                <div className="pt-3 border-t border-gray-200">
                  <Link
                    to={"/signup"}
                    className="block w-full px-4 py-2 rounded-full text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white transition-colors font-semibold text-center"
                    onClick={toggleSidebar}
                  >
                    Create New Account
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Social media icons */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Connect With Us
            </h3>
            <div className="flex justify-center space-x-4 mt-5">
              <a
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Twitch className="h-6 w-6" />
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={toggleSidebar}
        />
      )}
    </header>
  );
};

export default Navbar;
