import React from 'react';
import { FaTimes, FaPrint, FaUser, FaPhone, FaMapMarkerAlt, FaGem, FaCalendarAlt, FaPercentage, FaRupeeSign, FaHistory } from 'react-icons/fa';
import './LoanDetails.css';

const LoanDetails = ({ loan, onClose }) => {
  if (!loan) return null;

  const calculateInterest = () => {
    const today = new Date();
    const loanDate = new Date(loan.loanDate);
    const monthsDiff = Math.ceil((today - loanDate) / (1000 * 60 * 60 * 24 * 30));
    return (parseFloat(loan.loanAmount) * parseFloat(loan.interestRate) * monthsDiff) / 100;
  };

  const getTotalAmount = () => {
    return parseFloat(loan.loanAmount) + calculateInterest();
  };

  const getStatus = () => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    
    if (loan.status === 'closed') return 'Closed';
    if (loan.status === 'renewed') return 'Renewed';
    if (dueDate < today) return 'Overdue';
    if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'Due Soon';
    return 'Active';
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateTotalPaid = () => {
    if (!loan.payments || loan.payments.length === 0) return 0;
    return loan.payments.reduce((total, payment) => total + (payment.partialPayment || 0), 0);
  };

  const calculateExtraLoansGiven = () => {
    if (!loan.payments || loan.payments.length === 0) return 0;
    return loan.payments.reduce((total, payment) => total + (payment.extraLoan || 0), 0);
  };

  return (
    <div className="loan-details-overlay">
      <div className="loan-details-container">
        {/* Header */}
        <div className="loan-details-header">
          <div className="header-left">
            <h2>Loan Details</h2>
            <span className="loan-id-badge">#{loan.id}</span>
          </div>
          <div className="header-actions">
            <button className="btn-print" onClick={handlePrint}>
              <FaPrint /> Print
            </button>
            <button className="btn-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="loan-details-content">
          {/* Status and Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaRupeeSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">₹{parseFloat(loan.loanAmount).toLocaleString()}</div>
                <div className="stat-label">Principal Amount</div>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">
                <FaPercentage />
              </div>
              <div className="stat-content">
                <div className="stat-value">₹{calculateInterest().toLocaleString()}</div>
                <div className="stat-label">Interest Accrued</div>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-icon">
                <FaRupeeSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">₹{getTotalAmount().toLocaleString()}</div>
                <div className="stat-label">Total Amount</div>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-content">
                <div className="stat-value">{getStatus()}</div>
                <div className="stat-label">Status</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="details-grid">
            {/* Customer Information Card */}
            <div className="details-card">
              <div className="card-header">
                <FaUser className="card-icon" />
                <h3>Customer Information</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{loan.title} {loan.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{loan.relationType === 'father' ? 'Father Name' : 'Husband Name'}</span>
                  <span className="info-value">{loan.relationName}</span>
                </div>
                <div className="info-row">
                  <FaPhone className="info-icon" />
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{loan.phoneNumber}</span>
                </div>
                <div className="info-row">
                  <FaMapMarkerAlt className="info-icon" />
                  <span className="info-label">Address</span>
                  <span className="info-value">{loan.address}</span>
                </div>
              </div>
            </div>

            {/* Ornament Details Card */}
            <div className="details-card">
              <div className="card-header">
                <FaGem className="card-icon" />
                <h3>Ornament Details</h3>
              </div>
              <div className="card-content">
                <div className="ornament-type-badge">
                  {loan.ornamentType === 'both' ? 'Gold & Silver' : 
                   loan.ornamentType.charAt(0).toUpperCase() + loan.ornamentType.slice(1)}
                </div>
                
                {(loan.ornamentType === 'gold' || loan.ornamentType === 'both') && (
                  <div className="ornament-section gold">
                    <h4>Gold Details</h4>
                    <div className="ornament-details">
                      <div className="detail-item">
                        <span>Weight</span>
                        <span>{loan.goldWeight} grams</span>
                      </div>
                      <div className="detail-item">
                        <span>Rate</span>
                        <span>₹{loan.goldRate}/gram</span>
                      </div>
                      <div className="detail-item total">
                        <span>Value</span>
                        <span>₹{(parseFloat(loan.goldWeight) * parseFloat(loan.goldRate)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {(loan.ornamentType === 'silver' || loan.ornamentType === 'both') && (
                  <div className="ornament-section silver">
                    <h4>Silver Details</h4>
                    <div className="ornament-details">
                      <div className="detail-item">
                        <span>Weight</span>
                        <span>{loan.silverWeight} grams</span>
                      </div>
                      <div className="detail-item">
                        <span>Rate</span>
                        <span>₹{loan.silverRate}/gram</span>
                      </div>
                      <div className="detail-item total">
                        <span>Value</span>
                        <span>₹{(parseFloat(loan.silverWeight || 0) * parseFloat(loan.silverRate)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="total-estimation">
                  <div className="estimation-label">Total Estimated Value</div>
                  <div className="estimation-value">₹{loan.estimatedValue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Loan Terms Card */}
            <div className="details-card">
              <div className="card-header">
                <FaCalendarAlt className="card-icon" />
                <h3>Loan Terms</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="info-label">Loan Date</span>
                  <span className="info-value">{new Date(loan.loanDate).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Due Date</span>
                  <span className="info-value">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Interest Rate</span>
                  <span className="info-value">{loan.interestRate}% per month</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Current Status</span>
                  <span className={`status-badge status-${getStatus().toLowerCase().replace(' ', '-')}`}>
                    {getStatus()}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="details-card financial">
              <div className="card-header">
                <FaRupeeSign className="card-icon" />
                <h3>Financial Summary</h3>
              </div>
              <div className="card-content">
                <div className="financial-row">
                  <span className="financial-label">Original Principal</span>
                  <span className="financial-value">₹{parseFloat(loan.loanAmount).toLocaleString()}</span>
                </div>
                <div className="financial-row">
                  <span className="financial-label">Interest Accrued</span>
                  <span className="financial-value interest">₹{calculateInterest().toLocaleString()}</span>
                </div>
                <div className="financial-row">
                  <span className="financial-label">Extra Loans Given</span>
                  <span className="financial-value">₹{calculateExtraLoansGiven().toLocaleString()}</span>
                </div>
                <div className="financial-row">
                  <span className="financial-label">Total Payments Received</span>
                  <span className="financial-value received">₹{calculateTotalPaid().toLocaleString()}</span>
                </div>
                <div className="financial-row total">
                  <span className="financial-label">Total Amount Due</span>
                  <span className="financial-value">₹{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {loan.notes && (
            <div className="details-card full-width">
              <div className="card-header">
                <h3>Notes</h3>
              </div>
              <div className="card-content">
                <div className="notes-content">
                  {loan.notes}
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          {loan.payments && loan.payments.length > 0 && (
            <div className="details-card full-width">
              <div className="card-header">
                <FaHistory className="card-icon" />
                <h3>Payment History</h3>
              </div>
              <div className="card-content">
                <div className="payment-timeline">
                  {loan.payments.map((payment, index) => (
                    <div key={payment.id || index} className="payment-entry">
                      <div className="payment-date">
                        <div className="date-circle"></div>
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="payment-details">
                        {payment.partialPayment > 0 && (
                          <div className="payment-item received">
                            <div className="payment-type">Payment Received</div>
                            <div className="payment-amount">₹{payment.partialPayment.toLocaleString()}</div>
                          </div>
                        )}
                        {payment.extraLoan > 0 && (
                          <div className="payment-item given">
                            <div className="payment-type">Extra Loan Given</div>
                            <div className="payment-amount">₹{payment.extraLoan.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;