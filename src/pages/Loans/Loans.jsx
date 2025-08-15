import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaRedo,
  FaEye,
  FaMoneyBillWave,
} from "react-icons/fa";
import LoanForm from "./LoanForm";
import LoanDetails from "./LoanDetails";
import PaymentModal from "./PaymentModal";
import {
  calculateLoanInterest,
  calculateTotalPaid,
  getCurrentBalance,
  getLoanStatus,
} from "../../utils/interestCalculator";
import "./Loans.css";

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  const loansPerPage = 10;

  const fetchLoans = async () => {
    try {
      const response = await fetch("https://localhost:7133/api/Loan");
      if (!response.ok) throw new Error("Failed to fetch loans");
      const data = await response.json();
      console.log("Fetched loans from API:", data);
      setLoans(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const totalLoans = loans.length;
  const activeLoans = loans.filter((loan) => loan.status === "Active").length;
  const overdueLoans = loans.filter((loan) => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return dueDate < today && loan.status !== "closed";
  }).length;
  const totalAmount = loans.reduce(
    (sum, loan) => sum + parseFloat(loan.loanAmount || 0),
    0
  );

  const filteredLoans = loans.filter((loan) => {

    const search = searchTerm ? searchTerm.toLowerCase() : '';
    const matchesSearch =
      (loan.customerName && loan.customerName.toLowerCase().includes(search)) ||
      (loan.phoneNumber && loan.phoneNumber.includes(searchTerm)) ||
      (loan.LoanId !== undefined && loan.LoanId !== null && String(loan.LoanId).toLowerCase().includes(search)) ||
      (loan.id !== undefined && loan.id !== null && String(loan.id).toLowerCase().includes(search));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && loan.status === "Active") ||
      (filterStatus === "overdue" &&
        new Date(loan.dueDate) < new Date() &&
        loan.status !== "closed") ||
      (filterStatus === "due-soon" && loan.status === "Due Soon");

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLoans.length / loansPerPage);
  const startIndex = (currentPage - 1) * loansPerPage;
  const currentLoans = filteredLoans.slice(
    startIndex,
    startIndex + loansPerPage
  );

  const handleAddLoan = () => {
    setEditingLoan(null);
    setShowForm(true);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setShowForm(true);
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setShowDetails(true);
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      try {
        await fetch(`https://localhost:7133/api/Loan/${loanId}`, {
          method: "DELETE",
        });
        fetchLoans();
      } catch (error) {
        console.error("Failed to delete loan:", error);
        alert("Failed to delete loan.");
      }
    }
  };

  const handleRenewLoan = (loan) => {
    const newId = `${loan.id}-R${Date.now()}`;
    const renewedLoan = {
      ...loan,
      id: newId,
      loanDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "Active",
      payments: [],
      notes: `Renewed from ${loan.id}. ${loan.notes || ""}`,
    };

    setLoans((prevLoans) =>
      prevLoans.map((l) =>
        l.id === loan.id ? { ...l, status: "Renewed" } : l
      )
    );

    setEditingLoan(renewedLoan);
    setShowForm(true);
  };

  const handlePaymentAction = (loan) => {
    setPaymentLoan(loan);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (loanId, paymentData) => {
    try {
      // First, get the current loan data
      const loanResponse = await fetch(`https://localhost:7133/api/Loan/${loanId}`);
      if (!loanResponse.ok) throw new Error("Failed to fetch loan data");
      const currentLoan = await loanResponse.json();
      
      // Prepare the updated loan data with new payment
      const updatedPayments = [...(currentLoan.payments || []), {
        id: Date.now().toString(),
        date: paymentData.date,
        partialPayment: paymentData.partialPayment || 0,
        extraLoan: paymentData.extraLoan || 0
      }];
      
      const updatedLoanData = {
        ...currentLoan,
        payments: updatedPayments
      };
      
      // Update the loan with new payment data
      const response = await fetch(`https://localhost:7133/api/Loan/${loanId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLoanData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating loan with payment:", errorData);
        throw new Error("Failed to save payment");
      }
      
      // Refresh the loans list
      await fetchLoans();
      
      // Show success message
      alert("Payment/Extra loan saved successfully!");
      
    } catch (error) {
      console.error("Payment submission error:", error);
      alert(`Failed to save payment/extra loan: ${error.message}`);
    }
    
    setShowPaymentModal(false);
    setPaymentLoan(null);
  };

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      await fetchLoans();
    } catch (error) {
      alert("Failed to save payment/extra loan. Check backend.");
      console.error(error);
    }
    setShowPaymentModal(false);
    setPaymentLoan(null);
  };

  const handleFormSubmit = async (loanData) => {
    try {
      const response = await fetch("https://localhost:7133/api/Loan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from backend:", errorData);
        alert("Failed to save loan. Please check the input.");
        return;
      }

      await fetchLoans(); // refresh from backend
      setShowForm(false);
      setEditingLoan(null);
    } catch (error) {
      console.error("Failed to save loan:", error);
      alert("Failed to save loan. Check console.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (loan) => {
    const status = getLoanStatus(loan);
    const statusClassMap = {
      Active: "status-active",
      "Due Soon": "status-due-soon",
      Overdue: "status-overdue",
      Closed: "status-closed",
      Renewed: "status-renewed",
      Paid: "status-active",
    };

    return {
      text: status,
      class: statusClassMap[status] || "status-active",
    };
  };

  return (
    <div className="loans-page">
      <div className="loans-header">
        <div className="loans-title">
          <h1>Loan Management</h1>
          <p>Manage and track all your loans efficiently</p>
        </div>
        <button className="btn-add-loan" onClick={handleAddLoan}>
          <FaPlus /> Add New Loan
        </button>
      </div>

      {loading ? (
        <p>Loading loans...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div className="loans-summary">
            <div className="summary-card">
              <div className="summary-value">{totalLoans}</div>
              <div className="summary-label">Total Loans</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{activeLoans}</div>
              <div className="summary-label">Active Loans</div>
            </div>
            <div className="summary-card overdue">
              <div className="summary-value">{overdueLoans}</div>
              <div className="summary-label">Overdue Loans</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                ₹{totalAmount.toLocaleString()}
              </div>
              <div className="summary-label">Total Amount</div>
            </div>
          </div>

          <div className="loans-controls">
            <input
              type="text"
              placeholder="Search by name, phone, or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="due-soon">Due Soon</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="loans-table-container">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Guardian Name</th>
                  <th>Phone Number</th>
                  <th>Ornament</th>
                  <th className="amount-header">Principal</th>
                  <th className="amount-header">Interest</th>
                  <th className="amount-header">Total</th>
                  <th>Loan Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLoans.length > 0 ? (
                  currentLoans.map((loan) => {
                    const interestData = calculateLoanInterest(loan);
                    return (
                      <tr key={loan.id}>
                        <td className="loan-id">#{loan.loanid || loan.id}</td>
                        <td className="customer-name">
                          {loan.title} {loan.customerName}
                        </td>
                        <td className="guardian-name">{loan.relationName}</td>
                        <td>{loan.phoneNumber}</td>
                        <td>
                          {loan.ornamentType === "both"
                            ? "Gold & Silver"
                            : loan.ornamentType}
                          <br />
                          <small>
                            {loan.goldWeight && `G: ${loan.goldWeight}g`}
                            {loan.goldWeight && loan.silverWeight && ", "}
                            {loan.silverWeight && `S: ${loan.silverWeight}g`}
                          </small>
                        </td>
                        <td className="amount">
                          ₹{interestData.currentPrincipal.toLocaleString()}
                        </td>
                        <td className="amount interest-amount">
                          ₹{interestData.totalInterest.toLocaleString()}
                        </td>
                        <td className="amount total-amount">
                          ₹{interestData.totalAmount.toLocaleString()}
                        </td>
                        <td>
                          {new Date(loan.loanDate).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewLoan(loan)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEditLoan(loan)}
                              title="Edit Loan"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-action btn-payment"
                              onClick={() => handlePaymentAction(loan)}
                              title="Add Payment/Extra Loan"
                            >
                              <FaMoneyBillWave />
                            </button>
                            <button
                              className="btn-action btn-renew"
                              onClick={() => handleRenewLoan(loan)}
                              title="Renew Loan"
                            >
                              <FaRedo />
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteLoan(loan.id)}
                              title="Delete Loan"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="no-data">
                      {searchTerm || filterStatus !== "all"
                        ? "No loans match your search criteria"
                        : "No loans found. Click 'Add New Loan' to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          <div className="results-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + loansPerPage, filteredLoans.length)} of{" "}
            {filteredLoans.length} loans
          </div>
        </>
      )}

      {showForm && (
        <LoanForm
          loan={editingLoan}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingLoan(null);
          }}
        />
      )}

      {showDetails && selectedLoan && (
        <LoanDetails
          loan={selectedLoan}
          onClose={() => {
            setShowDetails(false);
            setSelectedLoan(null);
          }}
        />
      )}

      {showPaymentModal && paymentLoan && (
        <PaymentModal
          loan={paymentLoan}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentLoan(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};

export default Loans;
