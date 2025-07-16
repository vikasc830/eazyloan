import React from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
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

  return (
    <div className="loan-details-overlay">
      <div className="loan-details-container">
        <div className="loan-details-header">
          <h2>Loan Details</h2>
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
          {/* Loan Summary */}
          <div className="details-section">
            <div className="section-header">
              <h3>Loan Summary</h3>
              <span className={`status-badge status-${getStatus().toLowerCase().replace(' ', '-')}`}>
                {getStatus()}
              </span>
            </div>
            
            <div className="summary-grid">
              <div className="summary-item">
                <label>Loan ID</label>
                <span>#{loan.id.slice(-8)}</span>
              </div>
              <div className="summary-item">
                <label>Loan Date</label>
                <span>{new Date(loan.loanDate).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <label>Due Date</label>
                <span>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="summary-item">
                <label>Interest Rate</label>
                <span>{loan.interestRate}% per month</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="details-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span>{loan.title} {loan.customerName}</span>
              </div>
              <div className="info-item">
                <label>{loan.relationType === 'father' ? 'Father Name' : 'Husband Name'}</label>
                <span>{loan.relationName}</span>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <span>{loan.phoneNumber}</span>
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                <span>{loan.address}</span>
              </div>
            </div>
          </div>

          {/* Ornament Details */}
          <div className="details-section">
            <h3>Ornament Details</h3>
            <div className="ornament-grid">
              <div className="ornament-item">
                <label>Type</label>
                <span className="ornament-type">
                  {loan.ornamentType === 'both' ? 'Gold & Silver' : 
                   loan.ornamentType.charAt(0).toUpperCase() + loan.ornamentType.slice(1)}
                </span>
              </div>
              
              {(loan.ornamentType === 'gold' || loan.ornamentType === 'both') && (
                <>
                  <div className="ornament-item">
                    <label>Gold Weight</label>
                    <span>{loan.goldWeight} grams</span>
                  </div>
                  <div className="ornament-item">
                    <label>Gold Rate</label>
                    <span>₹{loan.goldRate}/gram</span>
                  </div>
                  <div className="ornament-item">
                    <label>Gold Value</label>
                    <span>₹{(parseFloat(loan.goldWeight) * parseFloat(loan.goldRate)).toLocaleString()}</span>
                  </div>
                </>
              )}
              
              {(loan.ornamentType === 'silver' || loan.ornamentType === 'both') && (
                <>
                  <div className="ornament-item">
                    <label>Silver Weight</label>
                    <span>{loan.silverWeight} grams</span>
                  </div>
                  <div className="ornament-item">
                    <label>Silver Rate</label>
                    <span>₹{loan.silverRate}/gram</span>
                  </div>
                  <div className="ornament-item">
                    <label>Silver Value</label>
                    <span>₹{(parseFloat(loan.silverWeight || 0) * parseFloat(loan.silverRate)).toLocaleString()}</span>
                  </div>
                </>
              )}
              
              <div className="ornament-item total-value">
                <label>Total Estimated Value</label>
                <span>₹{loan.estimatedValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="details-section">
            <h3>Financial Details</h3>
            <div className="financial-grid">
              <div className="financial-item">
                <label>Principal Amount</label>
                <span className="amount">₹{parseFloat(loan.loanAmount).toLocaleString()}</span>
              </div>
              <div className="financial-item">
                <label>Interest Accrued</label>
                <span className="amount interest">₹{calculateInterest().toLocaleString()}</span>
              </div>
              <div className="financial-item total">
                <label>Total Amount Due</label>
                <span className="amount total-amount">₹{getTotalAmount().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {loan.notes && (
            <div className="details-section">
              <h3>Notes</h3>
              <div className="notes-content">
                {loan.notes}
              </div>
            </div>
          )}

          {/* Payment History */}
          {loan.payments && loan.payments.length > 0 && (
            <div className="details-section">
              <h3>Payment History</h3>
              <div className="payment-history">
                {loan.payments.map((payment, index) => (
                  <div key={payment.id || index} className="payment-record">
                    <div className="payment-date">
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                    <div className="payment-details">
                      {payment.partialPayment > 0 && (
                        <div className="payment-item received">
                          <span className="payment-label">Payment Received:</span>
                          <span className="payment-amount">₹{payment.partialPayment.toLocaleString()}</span>
                        </div>
                      )}
                      {payment.extraLoan > 0 && (
                        <div className="payment-item given">
                          <span className="payment-label">Extra Loan Given:</span>
                          <span className="payment-amount">₹{payment.extraLoan.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;