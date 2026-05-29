import { Outlet } from "react-router-dom";
import Sidebar from "./VendorSidebar";
import { useState, useEffect } from "react";

function VendorLayout() {
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsCollapsed(localStorage.getItem("sidebarCollapsed") === "true");
    };

    // Listen for custom sidebar toggle event
    window.addEventListener("sidebarToggle", handleSidebarToggle);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
    };
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50">
      <Sidebar />

      <div
        className={`mr-2 sm:mr-5 mt-3 min-h-screen transition-all duration-300 overflow-x-hidden ${
          isCollapsed ? "ml-[85px] md:ml-16" : "ml-24 md:ml-[240px]"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default VendorLayout;
