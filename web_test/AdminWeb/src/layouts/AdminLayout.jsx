import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

const AdminLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 overflow-auto p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
