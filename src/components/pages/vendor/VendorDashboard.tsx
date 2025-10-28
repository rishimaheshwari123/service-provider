import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getVendorDashboardData } from "@/service/operations/dashboard";
import { Loader2, Briefcase, MessageCircle } from "lucide-react";
import VendorGetInquiry from "./VendorGetInquiry";

const VendorDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setLoading(true);
      const data = await getVendorDashboardData(user._id);
      setDashboardData(data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <p className="mt-5 mb-10 text-xl">
        Welcome {user?.name?.charAt(0).toUpperCase() + user?.name?.slice(1)} 👋
        to your vendor dashboard
      </p>

      <div className="mt-10">
        <p className="text-center text-3xl font-semibold mb-2 uppercase">
          Dashboard Overview
        </p>
        <p className="border-2 border-black w-32 mx-auto mb-10"></p>

        {/* ✅ Dashboard Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-2xl shadow-md text-center bg-gray-50 hover:shadow-lg transition">
            <Briefcase className="w-10 h-10 mx-auto text-blue-600 mb-3" />
            <p className="text-lg font-semibold text-gray-700">
              Total Services
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {dashboardData?.totalServices || 0}
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-md text-center bg-gray-50 hover:shadow-lg transition">
            <MessageCircle className="w-10 h-10 mx-auto text-green-600 mb-3" />
            <p className="text-lg font-semibold text-gray-700">
              Total Inquiries
            </p>
            <p className="text-3xl font-bold text-green-600">
              {dashboardData?.totalInquiries || 0}
            </p>
          </div>
        </div>

        <VendorGetInquiry />
      </div>
    </>
  );
};

export default VendorDashboard;
