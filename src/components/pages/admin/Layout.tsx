import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";

function Layout() {
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
    <div className="">
      <Sidebar />

      <div 
        className={`mx-5 mt-3 min-h-screen transition-all duration-300 ${
          isCollapsed ? "ml-24" : "ml-72"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
