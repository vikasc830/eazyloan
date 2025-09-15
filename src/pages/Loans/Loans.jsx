import "./Loans.css";

import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaRedo,
  FaEye,
  FaMoneyBillWave,
  FaLock,
} from "react-icons/fa";
import LoanForm from "./LoanForm";
import LoanDetails from "./LoanDetails";
import PaymentModal from "./PaymentModal";
import CloseLoanModal from "./CloseLoanModal";
import { calculateLoanInterest } from "../../utils/interestCalculator";

const Loans = () => {
  // --- State and logic ---
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [showCloseLoanModal, setShowCloseLoanModal] = useState(false);
  const [closingLoan, setClosingLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const loansPerPage = 10;

  const fetchLoans = async () => {
    try {
      const response = await fetch("https://localhost:7133/api/Loan");
      if (!response.ok) throw new Error("Failed to fetch loans");
      const data = await response.json();
      setLoans(data);
    } catch (err) {
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
  const totalAmount = loans.reduce((sum, loan) => {
    const interestData = calculateLoanInterest(loan);
    // Subtract total payments from principal+extra loans to get current principal outstanding
    let principal = interestData.totalPrincipalGiven - (interestData.totalPayments || 0);
    if (isNaN(principal)) {
      principal = parseFloat(loan.loanAmount) || 0;
    }
    return sum + Math.max(0, principal);
  }, 0);

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
      (filterStatus === "overdue" && new Date(loan.dueDate) < new Date() && loan.status !== "closed") ||
      (filterStatus === "due-soon" && loan.status === "Due Soon");
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLoans.length / loansPerPage);
  const startIndex = (currentPage - 1) * loansPerPage;
  const currentLoans = filteredLoans.slice(startIndex, startIndex + loansPerPage);

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
        await fetch(`https://localhost:7133/api/Loan/${loanId}`, { method: "DELETE" });
        fetchLoans();
      } catch (error) {
        alert("Failed to delete loan.");
      }
    }
  };
   const handleRenewLoan = (loan) => {
    // Generate a new unique loan ID for renewal
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const originalId = loan.LoanId || loan.loanId || loan.id;
    const newLoanId = `${originalId}-R${timestamp}`;
    
    const renewedLoan = {
      ...loan,
      LoanId: newLoanId, // Use LoanId for backend compatibility
      id: undefined, // Clear the old id
      loanDate: new Date().toISOString().split("T")[0],
      dueDate: null,
      status: "Active", 
      payments: [], // Clear payments for new loan
      Payments: [], // Clear Payments array as well
      notes: `Renewed from ${originalId}. ${loan.notes || ""}`,
      // Reset calculated fields
      estimatedValue: loan.estimatedValue || 0,
      goldRate: loan.goldRate || 0,
      silverRate: loan.silverRate || 0
    };

    // Set the renewed loan for editing
    setEditingLoan(renewedLoan);
    setShowForm(true);
  };

  const handlePaymentAction = (loan) => {
    setPaymentLoan(loan);
    setShowPaymentModal(true);
  };
  const handleCloseLoan = (loan) => {
    setClosingLoan(loan);
    setShowCloseLoanModal(true);
  };
  const handleCloseLoanSubmit = async (closureData) => {
    try {
      // closureData: { loanId, amountPaid, notes, closedDate }
      // Use LoanId for backend
      const loanId = closingLoan?.LoanId || closingLoan?.loanId || closingLoan?.id;
      const payload = {
        LoanId: String(loanId),
        AmountPaid: closureData.amountPaid,
        Notes: closureData.notes,
        ClosedDate: closureData.closedDate
      };
      const response = await fetch('https://localhost:7133/api/LoanClosure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to close loan');
      await fetchLoans();
    } catch (err) {
      alert(err.message || 'Error closing loan');
    } finally {
      setShowCloseLoanModal(false);
      setClosingLoan(null);
    }
  };
  const handleFormSubmit = async (loanData) => {
    try {
      // If editing, update; else, add new
      const isEdit = !!editingLoan;
      
      // For renewals, we always create a new loan (never update)
      const isRenewal = editingLoan && editingLoan.notes && editingLoan.notes.includes('Renewed from');
      
      const url = isEdit
        ? (isRenewal 
            ? 'https://localhost:7133/api/Loan' // Create new loan for renewal
            : `https://localhost:7133/api/Loan/${loanData.LoanId}`) // Update existing loan
        : 'https://localhost:7133/api/Loan';
        
      const method = (isEdit && !isRenewal) ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData),
      });
      
      if (!response.ok) throw new Error('Failed to save loan');
      
      // If this was a renewal, mark the original loan as renewed
      if (isRenewal && editingLoan.notes) {
        const originalLoanIdMatch = editingLoan.notes.match(/Renewed from (.+?)\./);
        if (originalLoanIdMatch) {
          const originalLoanId = originalLoanIdMatch[1];
          try {
            // Update the original loan status to "Renewed"
            const originalLoan = loans.find(l => 
              (l.LoanId || l.loanId || l.id) === originalLoanId
            );
            if (originalLoan) {
              const updatePayload = {
                ...originalLoan,
                Status: 'Renewed'
              };
              await fetch(`https://localhost:7133/api/Loan/${originalLoanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
              });
            }
          } catch (updateError) {
            console.warn('Failed to update original loan status:', updateError);
          }
        }
      }
      
      await fetchLoans();
    } catch (err) {
      alert(err.message || 'Error saving loan');
    } finally {
      setShowForm(false);
      setEditingLoan(null);
    }
  };
  const handlePaymentSubmit = async (loanId, paymentData) => {
    try {
      const url = `https://localhost:7133/api/Loan/${loanId}/payment`;
      const paymentPayload = {
        LoanId: String(loanId),
        PartialPayment: paymentData.partialPayment || 0,
        ExtraLoan: paymentData.extraLoan || 0,
        Date: paymentData.date
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });
      if (!response.ok) throw new Error('Failed to add payment');
      await fetchLoans();
    } catch (err) {
      alert(err.message || 'Error adding payment');
    } finally {
      setShowPaymentModal(false);
      setPaymentLoan(null);
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
                ₹{totalAmount >= 100000 ? (totalAmount / 100000).toFixed(1) + 'L' : totalAmount.toLocaleString()}
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
                      <tr key={loan.LoanId || loan.loanId || loan.id}>
                        <td className="loan-id">{loan.LoanId || loan.loanId || loan.id}</td>
                        <td className="customer-name">{loan.title} {loan.customerName}</td>
                        <td className="guardian-name">{loan.relationName}</td>
                        <td>{loan.phoneNumber}</td>
                        <td>
                          {loan.ornamentType === "both" ? "Gold & Silver" : loan.ornamentType}
                          <br />
                          <small>
                            {loan.goldWeight && `G: ${loan.goldWeight}g`}
                            {loan.goldWeight && loan.silverWeight && ", "}
                            {loan.silverWeight && `S: ${loan.silverWeight}g`}
                          </small>
                        </td>
                        <td className="amount">₹{interestData.totalPrincipalGiven.toLocaleString()}</td>
                        <td className="amount interest-amount">₹{interestData.totalInterest.toLocaleString()}</td>
                        <td className="amount total-amount">₹{interestData.currentOutstanding.toLocaleString()}</td>
                        <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action btn-view" onClick={() => handleViewLoan(loan)} title="View Details"><FaEye /></button>
                            <button className="btn-action btn-edit" onClick={() => handleEditLoan(loan)} title="Edit Loan"><FaEdit /></button>
                            <button className="btn-action btn-payment" onClick={() => handlePaymentAction(loan)} title="Add Payment/Extra Loan"><FaMoneyBillWave /></button>
                            <button className="btn-action btn-renew" onClick={() => handleRenewLoan(loan)} title="Renew Loan"><FaRedo /></button>
                            <button className="btn-action btn-delete" onClick={() => handleDeleteLoan(loan.LoanId || loan.loanId || loan.id)} title="Delete Loan"><FaTrash /></button>
                            <button className="btn-action btn-close-loan" onClick={() => handleCloseLoan(loan)} title="Close Loan" style={{ background: '#f1f5f9', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #cbd5e1' }}><FaLock style={{ fontSize: '1.1em', verticalAlign: 'middle' }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>No loans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
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
              onCloseLoan={handleCloseLoan}
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

          {showCloseLoanModal && closingLoan && (
            <CloseLoanModal
              loan={closingLoan}
              onClose={() => {
                setShowCloseLoanModal(false);
                setClosingLoan(null);
              }}
              onSubmit={handleCloseLoanSubmit}
            />
          )}
        </>
      )}
    </div>
  );
}
export default Loans;
