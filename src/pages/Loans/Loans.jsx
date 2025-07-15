// src/pages/Loans/Loans.jsx
import React from "react";
import LoanList from "./LoanList";
import "./Loan.css";

const Loans = () => {
  return (
    <div className="loans-page">
      <h2>Loan Management</h2>
      <LoanList />
    </div>
  );
};

export default Loans;
