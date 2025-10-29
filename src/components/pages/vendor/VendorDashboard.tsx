import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getVendorDashboardData } from "@/service/operations/dashboard";
import {
  Loader2,
  Briefcase,
  MessageCircle,
  User,
  PlusCircle,
  Wrench,
  Zap,
} from "lucide-react";
import VendorGetInquiry from "./VendorGetInquiry";
import { useNavigate } from "react-router-dom";

// Interface for the dashboard data for better type safety
interface VendorDashboardData {
  totalServices?: number;
  totalInquiries?: number;
}

const VendorDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<VendorDashboardData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        // Assuming getVendorDashboardData returns the required data
        const data = await getVendorDashboardData(user._id);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch vendor dashboard data:", error);
        // Set to default or handle error state
        setDashboardData({ totalServices: 0, totalInquiries: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Utility array for the Stats cards
  const statsCards = [
    {
      name: "Total Services",
      value: dashboardData?.totalServices || 0,
      icon: Briefcase,
      color: "from-indigo-500 to-indigo-600",
      shadow: "shadow-indigo-300",
    },
    {
      name: "New Inquiries",
      value: dashboardData?.totalInquiries || 0,
      icon: MessageCircle,
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-300",
    },
  ];

  // Quick Actions with updated modern icons and colors
  const quickActions = [
    {
      name: "Update Profile",
      description: "Manage and update your vendor profile details.",
      icon: <User className="w-6 h-6 text-indigo-500" />,
      path: "/vendor/my-profile",
    },
    {
      name: "Add New Service",
      description: "Expand your offerings by adding a new service.",
      icon: <PlusCircle className="w-6 h-6 text-emerald-500" />,
      path: "/vendor/services",
    },
    {
      name: "Manage Services",
      description: "Review, edit, or delete your existing services.",
      icon: <Wrench className="w-6 h-6 text-fuchsia-500" />,
      path: "/vendor/get-services",
    },
    {
      name: "View Inquiries",
      description: "Respond to customer messages and service requests.",
      icon: <MessageCircle className="w-6 h-6 text-amber-500" />,
      path: "/vendor/inquiry-services",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Hello, {""}
          <span className="text-indigo-600">
            {user?.name
              ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
              : "Vendor"}
          </span>
          ! 👋
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Welcome to your centralized management area.
        </p>
      </header>
      {/* Dashboard Stats (Modern Gradient Cards) */}
      <section className="mb-16">
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider">
            Performance Snapshot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {statsCards.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-xl p-8 transition duration-300 transform hover:scale-[1.02] cursor-pointer border border-gray-100 relative overflow-hidden`}
                style={{
                  boxShadow: `0 10px 15px -3px ${stat.shadow}, 0 4px 6px -4px ${stat.shadow}`,
                }} // Custom box shadow for a modern depth look
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-80 rounded-xl`}
                ></div>

                <div className="relative z-10 text-white flex justify-between items-center">
                  <div>
                    <p className="text-sm font-light uppercase">{stat.name}</p>
                    <p className="text-5xl font-extrabold mt-1">{stat.value}</p>
                  </div>
                  <StatIcon className="w-12 h-12 text-white opacity-90" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* Quick Actions Section (Modern Grid) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 uppercase tracking-wider">
          Quick Tools
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.path)}
              className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300 border-2 border-transparent hover:border-indigo-400 flex flex-col items-start justify-between text-left hover:scale-105"
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
      {/* Vendor Inquiry List */}
      <section className="mt-16">
        <VendorGetInquiry />
      </section>
    </div>
  );
};

export default VendorDashboard;
