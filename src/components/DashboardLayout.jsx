import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-right">
        <Topbar />
        <div className="dashboard-content">
          <Outlet /> {/* This renders /dashboard, /loans, etc. */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
