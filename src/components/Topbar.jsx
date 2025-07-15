import React from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "./Topbar.css";

const Topbar = () => {
  const location = useLocation();

  // Mapping paths to headings
  const getPageTitle = (path) => {
    if (path === "/dashboard") return "Dashboard";
    if (path === "/dashboard/loans") return "Loans";
    if (path === "/dashboard/reports") return "Reports";
    return "";
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="topbar">
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-icons">
        <FaBell className="topbar-icon" />
        <FaUserCircle className="topbar-icon" />
      </div>
    </div>
  );
};

export default Topbar;
