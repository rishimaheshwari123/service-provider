import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  BarChart3,
  User,
  UserRoundCog,
  UsersRound,
  FileText,
  LogOut,
  LifeBuoy,
  MessageSquare,
  Briefcase,
  ListChecks,
  ListOrdered,
  Wrench,
  Search,
  Megaphone,
  Tags,
  TicketPercent,
  FileSearch,
  RadioTower,
  Gift,
  Award,
  Settings,
} from "lucide-react";
import { FilePlus2, Files } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/redux/authSlice";
import { toast } from "react-toastify";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { endpoints } from "@/service/apis";
import { apiConnector } from "@/service/apiConnector";
import { FaPeopleArrows } from "react-icons/fa";
import { useVendorNotifications } from "@/hooks/useVendorNotifications";

const { LOGOUT_API } = endpoints;

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { pendingRequestsCount } = useVendorNotifications();
  const [openSections, setOpenSections] = useState({
    main: true,
    users: true,
    services: true,
    content: false,
    system: false,
  });

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await apiConnector("POST", LOGOUT_API);
    } catch (e) {
      console.error("Logout API failed:", e);
    }
    dispatch(setToken(null));
    dispatch(setUser(null));
    navigate("/");
    toast.success("User Logout Succesfully!");
  };

  // Function to toggle sidebar collapse
  const handleToggle = () => {
    const collapsed = !isCollapsed;
    setIsCollapsed(collapsed);
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
    // Dispatch custom event for Layout to listen
    window.dispatchEvent(new Event("sidebarToggle"));
  };

  // Effect to close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
        // Dispatch custom event for Layout to listen
        window.dispatchEvent(new Event("sidebarToggle"));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const sectionByPath = {
      main: ["/", "/admin/dashboard"],
      users: ["/admin/users", "/admin/vendors", "/admin/crm", "/admin/get-support"],
      services: ["/admin/services", "/admin/service-update-requests", "/admin/bookings", "/admin/categories", "/admin/coupons"],
      content: ["/admin/add-blog", "/admin/get-blog", "/admin/add-job", "/admin/get-jobs", "/admin/ads"],
      rewards: ["/admin/reward-settings", "/admin/reward-applications", "/admin/vendor-reward-settings"],
      system: ["/admin/logs", "/admin/communication-logs", "/admin/search-logs"],
    };

    const matchedSection = Object.entries(sectionByPath).find(([, paths]) =>
      paths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`))
    )?.[0];

    if (matchedSection) {
      setOpenSections((prev) => ({
        ...prev,
        [matchedSection]: true,
      }));
    }
  }, [location.pathname]);

  const allMenuItems = [
    {
      to: "/",
      icon: Home,
      label: "Back To Home",
      color: "text-blue-600",
      section: "main",
    },
    {
      to: "/admin/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      color: "text-green-600",
      section: "main",
    },
    {
      to: "/admin/services",
      icon: Wrench,
      label: "Manage Services",
      color: "text-blue-600",
      section: "services",
    },
    {
      to: "/admin/service-update-requests",
      icon: FileText,
      label: "Service Update Requests",
      color: "text-orange-600",
      section: "services",
    },
    {
      to: "/admin/vendors",
      icon: UserRoundCog,
      label: "Manage Partners",
      color: "text-orange-600",
      section: "users",
    },
    {
      to: "/admin/add-blog",
      icon: FilePlus2, // adding blog = plus file
      label: "Add Blog",
      color: "text-purple-600",
      section: "content",
    },
    {
      to: "/admin/get-blog",
      icon: Files, // multiple blogs listing
      label: "Get Blog",
      color: "text-pink-600",
      section: "content",
    },
    {
      to: "/admin/users",
      icon: User,
      label: "All Users",
      color: "text-teal-600",
      section: "users",
    },
    {
      to: "/admin/get-support",
      icon: LifeBuoy,
      label: "Customer Support",
      color: "text-teal-600",
      section: "users",
    },
    {
      to: "/admin/add-job",
      icon: Briefcase, // or any other suitable icon (import it from lucide-react)
      label: "Add Job",
      color: "text-orange-600",
      section: "content",
    },
    {
      to: "/admin/get-jobs",
      icon: ListChecks, // another good option, or you can use FileText
      label: "All Jobs",
      color: "text-blue-600",
      section: "content",
    },
    {
      to: "/admin/ads",
      icon: Megaphone,
      label: "Promote Your Service",
      color: "text-blue-600",
      section: "content",
    },
    {
      to: "/admin/bookings",
      icon: ListOrdered, // another good option, or you can use FileText
      label: "Bookings",
      color: "text-blue-600",
      section: "services",
    },
    {
      to: "/admin/crm",
      icon: FaPeopleArrows, // another good option, or you can use FileText
      label: "Manage Employee",
      color: "text-blue-600",
      section: "users",
    },
    {
      to: "/admin/categories",
      icon: Tags,
      label: "Manage Categories",
      color: "text-indigo-600",
      section: "services",
    },
    {
      to: "/admin/logs",
      icon: FileSearch,
      label: "Audit Logs",
      color: "text-indigo-600",
      section: "system",
    },
    {
      to: "/admin/communication-logs",
      icon: RadioTower,
      label: "Communication Logs",
      color: "text-green-600",
      section: "system",
    },
    {
      to: "/admin/search-logs",
      icon: Search,
      label: "Search Logs",
      color: "text-purple-600",
      section: "system",
    },
    {
      to: "/admin/coupons",
      icon: TicketPercent,
      label: "Coupon Management",
      color: "text-yellow-600",
      section: "services",
    },
    {
      to: "/admin/reward-settings",
      icon: Settings,
      label: "Reward Settings",
      color: "text-purple-600",
      section: "rewards",
    },
    {
      to: "/admin/reward-applications",
      icon: Gift,
      label: "Reward Applications",
      color: "text-pink-600",
      section: "rewards",
    },
    
  ];
  const sections = [
    { id: "main", label: "Main" },
    { id: "users", label: "Users" },
    { id: "services", label: "Services" },
    { id: "content", label: "Content" },
    { id: "rewards", label: "Rewards" },
    { id: "system", label: "System" },
  ] as const;
  const toggleSection = (sectionId: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };
  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isVendorsPage = item.to === "/admin/vendors";
    const showNotificationBadge = isVendorsPage && pendingRequestsCount > 0;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
            isActive
              ? `bg-blue-50 ${isCollapsed ? 'ring-2 ring-blue-600' : 'border-r-4 border-blue-600'} text-blue-700`
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative flex-shrink-0">
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-blue-600" : item.color
                } group-hover:scale-110 transition-transform`}
              />
              {showNotificationBadge && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                >
                  {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                </Badge>
              )}
            </div>
            <span
              className={`font-medium text-sm leading-tight ${
                isCollapsed ? "hidden" : "block"
              } transition-all duration-200 flex-1 min-w-0 break-words`}
            >
              {item.label}
            </span>
            {showNotificationBadge && !isCollapsed && (
              <Badge
                variant="destructive"
                className="ml-auto h-5 px-2 text-xs font-bold animate-pulse flex-shrink-0"
              >
                {pendingRequestsCount}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed h-screen top-0 z-50 ${
        isCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-200 shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div
          className={`${
            isCollapsed ? "hidden" : "flex"
          } items-center space-x-2`}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">Admin Panel</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation - Added overflow-y-auto and h-full for vertical scrolling */}
      <nav className="p-4 space-y-2 overflow-y-auto h-full">
        {isCollapsed ? (
          <div className="space-y-2">
            {allMenuItems.map((item) => renderMenuItem(item))}
          </div>
        ) : (
          sections.map((section) => {
            const sectionItems = allMenuItems.filter((item) => item.section === section.id);
            if (!sectionItems.length) return null;

            return (
              <div key={section.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openSections[section.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSections[section.id] && (
                  <div className="space-y-1">
                    {sectionItems.map((item) => renderMenuItem(item))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      <Separator className="mx-4" />

      {/* User Profile & Logout - Fixed at the bottom */}
      <div className="p-4 space-y-3">
        {/* User Profile */}
        <div
          className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name?.charAt(0).toUpperCase() + user?.name?.slice(1) ||
                  "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className={`w-full ${
            isCollapsed ? "px-2" : "px-4"
          } py-2 bg-red-600 hover:bg-red-700 transition-colors`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
