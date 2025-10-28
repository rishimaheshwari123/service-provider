import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAdminDashboardData } from "@/service/operations/dashboard";
import AllUsers from "./AllUsers";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState({
    users: 0,
    vendors: 0,
    services: 0,
    inquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const res = await getAdminDashboardData();
      setData(res);
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      <p className="mt-5 mb-10 text-xl text-center">
        Welcome{" "}
        {user?.name
          ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
          : "Admin"}{" "}
        👋 to our admin dashboard
      </p>

      <div className="mt-10 text-center">
        <p className="text-3xl font-semibold mb-2 uppercase">Dashboard Stats</p>
        <p className="border-2 border-black w-20 mx-auto mb-8"></p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-500 text-white rounded-2xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold">Users</h3>
            <p className="text-3xl font-bold mt-2">{data.users}</p>
          </div>

          <div className="bg-green-500 text-white rounded-2xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold">Vendors</h3>
            <p className="text-3xl font-bold mt-2">{data.vendors}</p>
          </div>

          <div className="bg-purple-500 text-white rounded-2xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold">Services</h3>
            <p className="text-3xl font-bold mt-2">{data.services}</p>
          </div>

          <div className="bg-red-500 text-white rounded-2xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold">Inquiries</h3>
            <p className="text-3xl font-bold mt-2">{data.inquiries}</p>
          </div>
        </div>
      )}

      <AllUsers />
    </div>
  );
};

export default Dashboard;
