import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAdminDashboardData } from "@/service/operations/dashboard";
import AllUsers from "./AllUsers";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserTie,
  FaBlog,
  FaClipboardList,
  FaHeadset,
  FaChartLine, // Added for a modern touch to the main stat section
} from "react-icons/fa";
import AdminDashboardSummary from "./AdminDashboardSummary";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { Button } from "@/components/ui/button";

// Interface for the dashboard data for better type safety
interface DashboardData {
  users: number;
  vendors: number;
  services: number;
  inquiries: number;
}

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<DashboardData>({
    users: 0,
    vendors: 0,
    services: 0,
    inquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  // Re-define quickActions with slightly refined descriptions and modern colors
  const quickActions = [
    {
      name: "Vendor Management",
      description: "Oversee and manage all registered vendor accounts.",
      icon: <FaUserTie className="text-3xl text-indigo-500" />, // Changed to indigo
      path: "/admin/vendors",
    },
    {
      name: "Create New Blog",
      description: "Draft, edit, and publish new content to the blog.",
      icon: <FaBlog className="text-3xl text-emerald-500" />, // Changed to emerald
      path: "/admin/add-blog",
    },
    {
      name: "Manage Blogs",
      description: "Review, update, or delete all published articles.",
      icon: <FaClipboardList className="text-3xl text-fuchsia-500" />, // Changed to fuchsia
      path: "/admin/get-blog",
    },
    {
      name: "All Users",
      description: "Access and manage the full list of registered users.",
      icon: <FaUsers className="text-3xl text-amber-500" />, // Changed to amber
      path: "/admin/users",
    },
    {
      name: "Customer Support",
      description: "Address incoming inquiries and service requests.",
      icon: <FaHeadset className="text-3xl text-rose-500" />, // Changed to rose
      path: "/admin/get-support",
    },
  ];

  // Utility array for the Stats cards to make rendering cleaner
  const statsCards = [
    {
      name: "Users",
      value: data.users,
      icon: FaUsers,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      name: "Vendors",
      value: data.vendors,
      icon: FaUserTie,
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      name: "Services",
      value: data.services,
      icon: FaClipboardList,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    // {
    //   name: "Inquiries",
    //   value: data.inquiries,
    //   icon: FaHeadset,
    //   color: "bg-gradient-to-r from-red-500 to-red-600",
    // },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = (user as any)?.token;
        const res = await getAdminDashboardData(token);
        setData(res);
        const cats = await getAllCategoriesAPI();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Optionally set data to default on error
        setData({ users: 0, vendors: 0, services: 0, inquiries: 0 });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <header className="mb-10 text-center">
        <h1 className="text-xl md:text-3xl  font-extrabold text-gray-800">
          Welcome back, {""}
          <span className="text-indigo-600">
            {user?.name
              ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
              : "Admin"}
          </span>
          ! 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Here is a snapshot of your system performance.
        </p>
      </header>

      {/* --- */}

      {/* Dashboard Stats (Modern Card Design) */}
      <section className="mb-16">
        <div className="flex items-center justify-center mb-6">
          <FaChartLine className="text-3xl text-indigo-600 mr-2" />
          <h2 className="text-sm md:text-2xl font-bold text-gray-800 uppercase tracking-wider">
            System Overview
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {/* Skeleton Loaders for a better UX */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-32 rounded-xl shadow-lg"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsCards.map((stat, index) => {
              const StatIcon = stat.icon; // Component for the icon
              return (
                <div
                  key={index}
                  className={`${stat.color} text-white rounded-xl shadow-2xl p-6 transition duration-300 transform hover:scale-[1.02] cursor-pointer relative overflow-hidden`}
                >
                  {/* Background subtle icon */}
                  <StatIcon className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 text-7xl" />

                  <div className="flex items-center justify-between z-10 relative">
                    <div>
                      <h3 className="text-sm font-light uppercase opacity-90">
                        {stat.name}
                      </h3>
                      <p className="text-4xl font-extrabold mt-1 flex items-center gap-2">
                        {stat.value}
                        {(stat.name === "Users" || stat.name === "Vendors") && (
                          <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-full">
                      <StatIcon className="text-2xl" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* <AdminDashboardSummary /> */}

      {/* --- */}

      {/* Quick Actions Section (Modern Grid) */}
      <section className="mb-16">
        <h2 className="text-sm md:text-2xl font-bold text-gray-800 text-center mb-8 uppercase tracking-wider">
          Quick Access & Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.path)}
              className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100 flex flex-col items-start justify-between text-left hover:border-indigo-400 hover:scale-105"
            >
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                {action.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">
                {action.name}
              </h3>
              <p className="text-gray-500 text-sm">{action.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- */}

      {/* Categories Overview */}
    <section className="mb-16">
  <div className="flex items-center justify-center mb-6">
    <h2 className="text-sm md:text-2xl font-bold text-gray-800">
      Categories Overview
    </h2>
  </div>

  {categories.length === 0 ? (
    <p className="text-gray-500 text-center">
      No categories created yet.
    </p>
  ) : (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.slice(0, 6).map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {c.name}
              </h3>
              <span className="text-sm text-gray-600">
                ₹{c.price}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Active: {c.active ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={() => navigate("/admin/categories")}>
          View All Categories
        </Button>
      </div>
    </>
  )}
</section>

      {/* All Users Component */}
      {/* <section className="mt-16">
        <AllUsers />
      </section> */}
    </div>
  );
};

export default Dashboard;
