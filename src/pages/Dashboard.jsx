import React from "react";
import "./Dashboard.css";

const metrics = [
  { title: "Total Customers", value: "1,245" },
  { title: "Active Loans", value: "378" },
  { title: "Pending Approvals", value: "26" },
  { title: "Total Revenue", value: "$1.2M" },
];

const Dashboard = () => {
  return (
    <div className="dashboard-grid">
      {metrics.map((metric, idx) => (
        <div key={idx} className="dashboard-card">
          <h4>{metric.title}</h4>
          <p>{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
