import React from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "./Topbar.css";

const Topbar = ({ onMobileMenuToggle }) => {
  const location = useLocation();

  // Mapping paths to headings
  const getPageTitle = (path) => {
    if (path === "/") return "Dashboard";
    if (path === "/loans") return "Loans";
    if (path === "/reports") return "Reports";
    return "";
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-menu-btn" onClick={onMobileMenuToggle}>
          <FaBars />
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>
      <div className="topbar-icons">
        <FaBell className="topbar-icon" />
        <FaUserCircle className="topbar-icon" />
      </div>
    </div>
  );
};

export default Topbar;
