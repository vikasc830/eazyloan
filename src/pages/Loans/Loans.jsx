import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaRedo, FaEye, FaHistory, FaMoneyBillWave } from "react-icons/fa";
import LoanForm from "./LoanForm";
import LoanDetails from "./LoanDetails";
import PaymentModal from "./PaymentModal";
import { 
  calculateLoanInterest, 
  calculateTotalPaid, 
  getCurrentBalance, 
  getLoanStatus 
} from "../../utils/interestCalculator";
import "./Loans.css";

const Loans = () => {
  const [loans, setLoans] = useState([
    {
      id: "LN001",
      customerName: "John Doe",
      title: "Mr",
      relationName: "Richard Doe",
      relationType: "father",
      phoneNumber: "9876543210",
      address: "123 Main Street, Town",
      ornamentType: "gold",
      goldWeight: "10",
      silverWeight: "",
      loanAmount: "50000",
      interestRate: "2",
      loanDate: "2024-01-01",
      dueDate: "2024-07-01",
      estimatedValue: 60000,
      goldRate: 6500,
      silverRate: 85,
      notes: "Regular customer",
      payments: [],
      status: "Active",
    },
    {
      id: "LN002",
      customerName: "Jane Smith",
      title: "Mrs",
      relationName: "Robert Smith",
      relationType: "husband",
      phoneNumber: "9876543211",
      address: "456 Oak Avenue, City",
      ornamentType: "both",
      goldWeight: "15",
      silverWeight: "50",
      loanAmount: "75000",
      interestRate: "2",
      loanDate: "2024-02-15",
      dueDate: "2024-08-15",
      estimatedValue: 90000,
      goldRate: 6500,
      silverRate: 85,
      notes: "Premium customer",
      payments: [],
      status: "Active",
    },
   
  ]);

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

  // Calculate summary statistics
  const totalLoans = loans.length;
  const activeLoans = loans.filter(loan => loan.status === "Active").length;
  const overdueLoans = loans.filter(loan => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return dueDate < today && loan.status !== "closed";
  }).length;
  const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);

  // Filter and search loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.phoneNumber.includes(searchTerm) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "active" && loan.status === "Active") ||
      (filterStatus === "overdue" && new Date(loan.dueDate) < new Date() && loan.status !== "closed") ||
      (filterStatus === "due-soon" && loan.status === "Due Soon");
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
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

  const handleDeleteLoan = (loanId) => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      setLoans(loans.filter(loan => loan.id !== loanId));
      // Reset to first page if current page becomes empty
      if (currentLoans.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleRenewLoan = (loan) => {
    const newId = `${loan.id}-R${Date.now()}`;
    const renewedLoan = {
      ...loan,
      id: newId,
      loanDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      status: "Active",
      payments: [],
      notes: `Renewed from ${loan.id}. ${loan.notes || ""}`
    };
    
    // Mark original loan as renewed
    setLoans(prevLoans => 
      prevLoans.map(l => 
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

  const handlePaymentSubmit = (loanId, paymentData) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => {
        if (loan.id === loanId) {
          const updatedPayments = [...(loan.payments || []), {
            id: Date.now().toString(),
            date: paymentData.date,
            partialPayment: paymentData.partialPayment || 0,
            extraLoan: paymentData.extraLoan || 0,
            timestamp: new Date().toISOString()
          }];
          
          // Update loan amount if extra loan is given
          const newLoanAmount = parseFloat(loan.loanAmount) + (paymentData.extraLoan || 0);
          
          return {
            ...loan,
            loanAmount: newLoanAmount.toString(),
            payments: updatedPayments
          };
        }
        return loan;
      })
    );
    
    setShowPaymentModal(false);
    setPaymentLoan(null);
  };

  const calculateTotalPaid = (loan) => {
    if (!loan.payments || loan.payments.length === 0) return 0;
    return loan.payments.reduce((total, payment) => total + (payment.partialPayment || 0), 0);
  };

  const handleFormSubmit = (loanData) => {
    if (editingLoan && loans.find(l => l.id === editingLoan.id)) {
      // Update existing loan
      setLoans(loans.map(loan => 
        loan.id === editingLoan.id ? { ...loanData, payments: loan.payments } : loan
      ));
    } else {
      // Add new loan
      setLoans([...loans, { ...loanData, payments: [] }]);
    }
    setShowForm(false);
    setEditingLoan(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (loan) => {
    const status = getLoanStatus(loan);
    const statusClassMap = {
      'Active': 'status-active',
      'Due Soon': 'status-due-soon',
      'Overdue': 'status-overdue',
      'Closed': 'status-closed',
      'Renewed': 'status-renewed',
      'Paid': 'status-active'
    };
    
    return { 
      text: status, 
      class: statusClassMap[status] || 'status-active' 
    };
  };

  return (
    <div className="loans-page">
      {/* Header */}
      <div className="loans-header">
        <div className="loans-title">
          <h1>Loan Management</h1>
          <p>Manage and track all your loans efficiently</p>
        </div>
        <button className="btn-add-loan" onClick={handleAddLoan}>
          <FaPlus /> Add New Loan
        </button>
      </div>

      {/* Summary Cards */}
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
          <div className="summary-value">₹{totalAmount.toLocaleString()}</div>
          <div className="summary-label">Total Amount</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="loans-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name, phone, or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-section">
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
      </div>

      {/* Loans Table */}
      <div className="loans-table-container">
        <table className="loans-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Guardian Name</th>
              <th>Phone Number</th>
              <th>Ornament</th>
              <th className="amount-header">Total Principal</th>
              <th className="amount-header">Total Interest</th>
              <th className="amount-header">Total Amount</th>
              <th>Date of Loan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLoans.length > 0 ? (
              currentLoans.map((loan) => {
                const interestData = calculateLoanInterest(loan);
                const totalPaid = calculateTotalPaid(loan);
                const currentBalance = getCurrentBalance(loan);
                
                return (
                  <tr key={loan.id}>
                    <td className="loan-id">#{loan.id}</td>
                    <td className="customer-name">{loan.title} {loan.customerName}</td>
                    <td className="guardian-name">{loan.relationName}</td>
                    <td>{loan.phoneNumber}</td>
                    <td>
                      <div className="ornament-info">
                        {loan.ornamentType === 'both' ? 'Gold & Silver' : 
                         loan.ornamentType.charAt(0).toUpperCase() + loan.ornamentType.slice(1)}
                        <br />
                        <small>
                          {loan.goldWeight && `G: ${loan.goldWeight}g`}
                          {loan.goldWeight && loan.silverWeight && ', '}
                          {loan.silverWeight && `S: ${loan.silverWeight}g`}
                        </small>
                      </div>
                    </td>
                    <td className="amount">₹{interestData.currentPrincipal.toLocaleString()}</td>
                    <td className="amount interest-amount">₹{interestData.totalInterest.toLocaleString()}</td>
                    <td className="amount total-amount">₹{interestData.totalAmount.toLocaleString()}</td>
                    <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
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
                    : "No loans found. Click 'Add New Loan' to get started."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        Showing {startIndex + 1} to {Math.min(startIndex + loansPerPage, filteredLoans.length)} of {filteredLoans.length} loans
      </div>

      {/* Modals */}
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