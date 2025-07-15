import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import LoanList from './LoanList';
import LoanForm from './LoanForm';
import LoanDetails from './LoanDetails';
import './Loans.css';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [viewingLoan, setViewingLoan] = useState(null);

  // Load loans from localStorage on component mount
  useEffect(() => {
    const savedLoans = localStorage.getItem('loans');
    if (savedLoans) {
      setLoans(JSON.parse(savedLoans));
    }
  }, []);

  // Save loans to localStorage whenever loans change
  useEffect(() => {
    localStorage.setItem('loans', JSON.stringify(loans));
  }, [loans]);

  const handleAddLoan = () => {
    setEditingLoan(null);
    setShowForm(true);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setShowForm(true);
  };

  const handleDeleteLoan = (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan? This action cannot be undone.')) {
      setLoans(loans.filter(loan => loan.id !== loanId));
    }
  };

  const handleRenewLoan = (loan) => {
    const renewalConfirmed = window.confirm(
      `Are you sure you want to renew the loan for ${loan.customerName}?\n\n` +
      `Current loan amount: ₹${parseFloat(loan.loanAmount).toLocaleString()}\n` +
      `This will create a new loan entry.`
    );

    if (renewalConfirmed) {
      const today = new Date();
      const newDueDate = new Date(today);
      newDueDate.setMonth(newDueDate.getMonth() + 1); // Default 1 month renewal

      const renewedLoan = {
        ...loan,
        id: Date.now().toString(),
        loanDate: today.toISOString().split('T')[0],
        dueDate: newDueDate.toISOString().split('T')[0],
        status: 'renewed',
        notes: `Renewed from loan #${loan.id.slice(-6)}. ${loan.notes || ''}`
      };

      // Mark original loan as renewed
      setLoans(prevLoans => [
        ...prevLoans.map(l => l.id === loan.id ? { ...l, status: 'renewed' } : l),
        renewedLoan
      ]);
    }
  };

  const handleViewLoan = (loan) => {
    setViewingLoan(loan);
  };

  const handleFormSubmit = (loanData) => {
    if (editingLoan) {
      // Update existing loan
      setLoans(loans.map(loan => 
        loan.id === editingLoan.id ? loanData : loan
      ));
    } else {
      // Add new loan
      setLoans([...loans, loanData]);
    }
    
    setShowForm(false);
    setEditingLoan(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLoan(null);
  };

  const handleCloseDetails = () => {
    setViewingLoan(null);
  };

  // Calculate summary statistics
  const totalLoans = loans.length;
  const activeLoans = loans.filter(loan => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return loan.status !== 'closed' && dueDate >= today;
  }).length;
  
  const overdueLoans = loans.filter(loan => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return loan.status !== 'closed' && dueDate < today;
  }).length;

  const totalLoanAmount = loans
    .filter(loan => loan.status !== 'closed')
    .reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);

  return (
    <div className="loans-page">
      <div className="loans-header">
        <div className="loans-title">
          <h1>Loan Management</h1>
          <p>Manage your gold and silver ornament loans</p>
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
          <div className="summary-value">₹{totalLoanAmount.toLocaleString()}</div>
          <div className="summary-label">Total Amount</div>
        </div>
      </div>

      {/* Loan List */}
      <LoanList 
        loans={loans}
        onEdit={handleEditLoan}
        onDelete={handleDeleteLoan}
        onRenew={handleRenewLoan}
        onView={handleViewLoan}
      />

      {/* Loan Form Modal */}
      {showForm && (
        <LoanForm
          loan={editingLoan}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Loan Details Modal */}
      {viewingLoan && (
        <LoanDetails
          loan={viewingLoan}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Loans;