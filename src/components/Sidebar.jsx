import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyCheckAlt,
  FaChartBar,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";
import logo from "../images/EazyLoanLogo.png";

const Sidebar = ({ isOpen, onClose }) => {
  const getLinkClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  // Close mobile menu when clicking outside or on link
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay active" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <button className="mobile-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      <div className="sidebar-header">
        <img src={logo} alt="CrediFlow Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
          <NavLink to="/" end className={getLinkClass} onClick={handleLinkClick}>
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/loans" className={getLinkClass} onClick={handleLinkClick}>
            <FaMoneyCheckAlt className="sidebar-icon" />
            <span>Loans</span>
          </NavLink>
          <NavLink to="/reports" className={getLinkClass} onClick={handleLinkClick}>
            <FaChartBar className="sidebar-icon" />
            <span>Reports</span>
          </NavLink>
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;
