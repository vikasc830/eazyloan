import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyCheckAlt,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";
import logo from "../images/EazyLoanLogo.png";

const Sidebar = () => {
  const getLinkClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="CrediFlow Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
       <NavLink to="/dashboard" end className={getLinkClass}>
  <FaTachometerAlt className="sidebar-icon" />
  <span>Dashboard</span>
</NavLink>
<NavLink to="/dashboard/loans" className={getLinkClass}>
  <FaMoneyCheckAlt className="sidebar-icon" />
  <span>Loans</span>
</NavLink>
<NavLink to="/dashboard/reports" className={getLinkClass}>
  <FaChartBar className="sidebar-icon" />
  <span>Reports</span>
</NavLink>
        <NavLink to="/" className="sidebar-link">
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
