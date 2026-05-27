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
import DashboardSummary from "./DashboardSummary";
import {
  getPurchasedCategoriesAPI,
  getAllCategoriesAPI,
} from "@/service/operations/category";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Interface for the dashboard data for better type safety
interface VendorDashboardData {
  totalServices?: number;
  totalInquiries?: number;
}

const VendorDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<VendorDashboardData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasedCategories, setPurchasedCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const token = (user as any)?.token;
        // Assuming getVendorDashboardData returns the required data
        const data = await getVendorDashboardData(user._id, token);
        setDashboardData(data);
        const cats = await getPurchasedCategoriesAPI(user._id);
        // API may return purchase objects with nested `category` field
        // normalize to a simple category shape for rendering
        const normalized = (cats || []).map((item: any) => {
          if (item?.category) {
            return {
              ...item.category,
              // preserve price or use category price
              price: item.price ?? item.category.price,
              priceTier: item.priceTier,
            };
          }
          return item;
        });
        setPurchasedCategories(normalized);
        const all = await getAllCategoriesAPI();
        setAllCategories(all);
      } catch (error) {
        console.error("Failed to fetch vendor dashboard data:", error);
        // Set to default or handle error state
        setDashboardData({ totalServices: 0, totalInquiries: 0 });
        setPurchasedCategories([]);
        setAllCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredPurchased = purchasedCategories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredAvailable = allCategories
    .filter((ac) => !purchasedCategories.some((pc) => pc._id === ac._id))
    .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));

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

      <DashboardSummary />
      <br />
      {/* Categories Tab */}
      <section className="mb-16">
        <Tabs defaultValue="purchased" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>

            <button
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-white rounded-md"
              onClick={() => navigate("/vendor/purchase-categories")}
            >
              Go to Purchase
            </button>
          </div>
          <div className="mb-4">
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <TabsList>
            <TabsTrigger value="purchased">Purchased</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>
          <TabsContent value="purchased" className="mt-6">
            {filteredPurchased.length === 0 ? (
              <p className="text-gray-500">
                You have not purchased any categories yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredPurchased.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">
                        {c.name}
                      </h3>
                      <span className="text-sm text-gray-600">₹{c.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      You can add services under this category.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="available" className="mt-6">
            {filteredAvailable.length === 0 ? (
              <p className="text-gray-500">No categories available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredAvailable.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">
                        {c.name}
                      </h3>
                      <span className="text-sm text-gray-600">₹{c.price}</span>
                    </div>
                    <button
                      className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md"
                      onClick={() => navigate("/vendor/purchase-categories")}
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
      {/* Quick Actions Section (Modern Grid) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 uppercase tracking-wider">
          Quick Tools
        </h2>

        <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
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
