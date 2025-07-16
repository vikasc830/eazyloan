// src/pages/loans/Loans.jsx
import React, { useState } from "react";
import LoanFormModal from "./LoanFormModal";
import PaymentModal from "./PaymentModal";
import "./Loan.css";

const Loans = () => {
  const [loans, setLoans] = useState([
    {
      id: "LN001",
      customerName: "John Doe",
      fatherOrHusbandName: "Richard Doe",
      phone: "9876543210",
      aadhar: "1234 5678 9012",
      address: "123 Main Street, Town",
      ornamentType: "gold",
      goldWeight: "10",
      silverWeight: "",
      amount: 50000,
      estimationValue: 60000,
      loanDate: "2024-01-01",
      payments: [],
      status: "Active",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleHistory, setVisibleHistory] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const loansPerPage = 10;

  const handleAddLoan = (newLoan) => {
    setLoans([...loans, { ...newLoan, payments: [] }]);
  };

  const handleEditLoan = (updatedLoan) => {
    setLoans(loans.map((loan) => (loan.id === updatedLoan.id ? { ...loan, ...updatedLoan } : loan)));
  };

  const handleDeleteLoan = (id) => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      setLoans(loans.filter((loan) => loan.id !== id));
    }
  };

  const handleFormSubmit = (loanData) => {
    const isEditing = loans.some((loan) => loan.id === loanData.id);
    if (isEditing) {
      handleEditLoan(loanData);
    } else {
      handleAddLoan(loanData);
    }
    setEditLoan(null);
    setShowModal(false);
  };

  const handleRenewLoan = (oldLoan) => {
    const newId = prompt("Enter new Loan ID for the renewed loan:");
    if (!newId) return;

    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === oldLoan.id ? { ...loan, status: "Renewed" } : loan
      )
    );

    const renewedLoan = {
      ...oldLoan,
      id: newId,
      loanDate: new Date().toISOString().slice(0, 10),
      status: "Active",
      payments: [],
    };

    setEditLoan(renewedLoan);
    setShowModal(true);
  };

  const handleAddPayment = (loanId, payment) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.id === loanId) {
          const updatedPayments = [...loan.payments, payment];
          const updatedAmount = loan.amount - payment.partialPayment + payment.extraLoan;
          return { ...loan, payments: updatedPayments, amount: updatedAmount };
        }
        return loan;
      })
    );
    setSelectedLoanForPayment(null);
  };

  const calculateInterestDays = (loanDate) => {
    const start = new Date(loanDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} months / ${diffDays} days`;
  };

  const filteredLoans = loans.filter(
    (loan) =>
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.fatherOrHusbandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalPages = Math.ceil(filteredLoans.length / loansPerPage);

  return (
    <div className="loans-page">
      <div className="loans-header">
        <h2>Loan Management</h2>
        <button className="add-loan-btn" onClick={() => {
          setEditLoan(null);
          setShowModal(true);
        }}>
          + Add Loan
        </button>
      </div>

      <div className="loan-search-bar">
        <input
          type="text"
          placeholder="Search by customer name, guardian, or loan ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="loan-table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Customer</th>
            <th>Guardian Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Interest</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentLoans.map((loan) => (
            <React.Fragment key={loan.id}>
              <tr>
                <td>{loan.id}</td>
                <td>{loan.customerName}</td>
                <td>{loan.fatherOrHusbandName}</td>
                <td>₹{loan.amount}</td>
                <td>{loan.status}</td>
                <td>
                  ₹
                  {(
                    (loan.amount * 0.10) /
                    12 *
                    ((new Date() - new Date(loan.loanDate)) / (1000 * 60 * 60 * 24 * 30))
                  ).toFixed(2)}
                </td>
                <td>{calculateInterestDays(loan.loanDate)}</td>
                <td>
                  <div className="dropdown">
                    <button
                      className="action-btn"
                      onClick={() =>
                        setOpenDropdownId(openDropdownId === loan.id ? null : loan.id)
                      }
                    >
                      Actions ▾
                    </button>
                    {openDropdownId === loan.id && (
                      <div className="dropdown-content">
                        <button onClick={() => setEditLoan(loan)}>Edit</button>
                        <button onClick={() => handleDeleteLoan(loan.id)}>Delete</button>
                        <button onClick={() => handleRenewLoan(loan)}>Renew</button>
                        <button onClick={() => setSelectedLoanForPayment(loan)}>Add Payment</button>
                        <button onClick={() =>
                          setVisibleHistory((prev) => (prev === loan.id ? null : loan.id))
                        }>
                          {visibleHistory === loan.id ? "Hide History" : "View History"}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>

              {visibleHistory === loan.id && loan.payments.length > 0 && (
                <tr className="payment-history-row">
                  <td colSpan="8">
                    <strong>Payment History:</strong>
                    <ul className="payment-history-list">
                      {loan.payments.map((p, index) => (
                        <li key={index}>
                          <span>{p.date}</span> —
                          {p.partialPayment > 0 && (
                            <span> Partial Paid: ₹{p.partialPayment}</span>
                          )}
                          {p.extraLoan > 0 && (
                            <span style={{ marginLeft: "1rem" }}>
                              Extra Loan: ₹{p.extraLoan}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <LoanFormModal
        isOpen={showModal}
        onClose={() => {
          setEditLoan(null);
          setShowModal(false);
        }}
        onSubmit={handleFormSubmit}
        initialData={editLoan}
      />

      {selectedLoanForPayment && (
        <PaymentModal
          loan={selectedLoanForPayment}
          onClose={() => setSelectedLoanForPayment(null)}
          onSubmit={handleAddPayment}
        />
      )}
    </div>
  );
};

export default Loans;
