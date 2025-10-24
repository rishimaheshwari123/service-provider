import { Outlet } from "react-router-dom";
import Sidebar from "./VendorSidebar";

function VendorLayout() {
  return (
    <div className="">
      <Sidebar />

      <div className="lg:ml-24 mx-5 mt-3 ml-[100px] min-h-screen  ">
        <Outlet />
      </div>
    </div>
  );
}

export default VendorLayout;
