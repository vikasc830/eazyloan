import React, { useState } from 'react';
import { FaEdit, FaTrash, FaRedo, FaEye } from 'react-icons/fa';
import './LoanList.css';

const DEFAULT_SORT_KEY = 'loanDate';

const LoanList = ({ loans, onEdit, onDelete, onRenew, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_KEY);
  const [sortOrder, setSortOrder] = useState('desc');

  const getStatus = (loan) => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    const loanDate = new Date(loan.loanDate);
    
    if (loan.status === 'closed') return 'Closed';
    if (loan.status === 'renewed') return 'Renewed';
    if (dueDate < today) return 'Overdue';
    if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'Due Soon';
    return 'Active';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Due Soon': return 'status-due-soon';
      case 'Overdue': return 'status-overdue';
      case 'Closed': return 'status-closed';
      case 'Renewed': return 'status-renewed';
      default: return 'status-active';
    }
  };

  const calculateInterest = (loan) => {
    const today = new Date();
    const loanDate = new Date(loan.loanDate);
    const monthsDiff = Math.ceil((today - loanDate) / (1000 * 60 * 60 * 24 * 30));
    return (parseFloat(loan.loanAmount) * parseFloat(loan.interestRate) * monthsDiff) / 100;
  };

  const filteredAndSortedLoans = loans
    .filter(loan => {


      const search = searchTerm ? searchTerm.toLowerCase() : '';
      const matchesSearch =
        (loan.customerName && loan.customerName.toLowerCase().includes(search)) ||
        (loan.phoneNumber && loan.phoneNumber.includes(searchTerm)) ||
        (loan.LoanId !== undefined && loan.LoanId !== null && String(loan.LoanId).toLowerCase().includes(search)) ||
        (loan.id !== undefined && loan.id !== null && String(loan.id).toLowerCase().includes(search));

      const status = getStatus(loan);
      const matchesFilter = filterStatus === 'all' || status.toLowerCase().includes(filterStatus.toLowerCase());

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'loanAmount':
          aValue = parseFloat(a.loanAmount);
          bValue = parseFloat(b.loanAmount);
          break;
        case DEFAULT_SORT_KEY:
          aValue = new Date(a.loanDate);
          bValue = new Date(b.loanDate);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loans.length === 0) {
    return (
      <div className="empty-state">
        <h3>No loans found</h3>
        <p>Start by adding your first loan using the "Add New Loan" button.</p>
      </div>
    );
  }

  return (
    <div className="loan-list">
      {/* Filters and Search */}
      <div className="loan-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, phone, or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="due">Due Soon</option>
            <option value="overdue">Overdue</option>
            <option value="closed">Closed</option>
            <option value="renewed">Renewed</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="loanDate">Loan Date</option>
            <option value="customerName">Customer Name</option>
            <option value="loanAmount">Loan Amount</option>
            <option value="dueDate">Due Date</option>
          </select>
          
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Loan Table */}
      <div className="loan-table-container">
        <table className="loan-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Ornament</th>
              <th>Loan Amount</th>
              <th>Interest</th>
              <th>Loan Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLoans.map((loan) => {
              const status = getStatus(loan);
              const interest = calculateInterest(loan);
              
              return (
                <tr key={loan.id}>
                  <td className="loan-id">{loan.LoanId ? loan.LoanId : `#${loan.id.slice(-6)}`}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{loan.title} {loan.customerName}</strong>
                      <small>S/o {loan.relationName}</small>
                    </div>
                  </td>
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
                  <td className="amount">₹{parseFloat(loan.loanAmount).toLocaleString()}</td>
                  <td className="amount">₹{interest.toLocaleString()}</td>
                  <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                  <td>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-view" 
                        onClick={() => onView(loan)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => onEdit(loan)}
                        title="Edit Loan"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-action btn-renew" 
                        onClick={() => onRenew(loan)}
                        title="Renew Loan"
                      >
                        <FaRedo />
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => onDelete(loan.id)}
                        title="Delete Loan"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedLoans.length === 0 && loans.length > 0 && (
        <div className="no-results">
          <p>No loans match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default LoanList;