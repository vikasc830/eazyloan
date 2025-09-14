import React from 'react';
import { FaTimes, FaPrint, FaUser, FaPhone, FaMapMarkerAlt, FaGem, FaCalendarAlt, FaPercentage, FaRupeeSign, FaHistory } from 'react-icons/fa';
import { 
  calculateLoanInterest, 
  calculateTotalPaid, 
  calculateTotalExtraLoans, 
  getCurrentBalance, 
  getLoanStatus 
} from "../../utils/interestCalculator";
import './LoanDetails.css';


const LoanDetails = ({ loan, onClose }) => {
  if (!loan) return null;

  // Calculate all interest and payment data
  const interestData = calculateLoanInterest(loan);
  const totalPaid = calculateTotalPaid(loan);
  const totalExtraLoans = calculateTotalExtraLoans(loan);
  const currentBalance = getCurrentBalance(loan);
  const status = getLoanStatus(loan);
  // Prefer DB loanId, else fallback to id
  const displayLoanId = loan.loanId || (loan.id ? `#${loan.id.slice ? loan.id.slice(-6) : loan.id}` : "-");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="loan-details-overlay">
      <div className="loan-details-container">
        {/* Header */}
        <div className="loan-details-header">
          <div className="header-left">
            <h2>Loan Details</h2>
            <span className="loan-id-badge">{displayLoanId}</span>
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
                <div className="stat-label">Original Principal</div>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">
                <FaPercentage />
              </div>
              <div className="stat-content">
                <div className="stat-value">₹{interestData.totalInterest.toLocaleString()}</div>
                <div className="stat-label">Interest Accrued</div>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-icon">
                <FaRupeeSign />
              </div>
              <div className="stat-content">
                <div className="stat-value">₹{interestData.totalAmount.toLocaleString()}</div>
                <div className="stat-label">Total Amount</div>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-content">
                <div className="stat-value">{status}</div>
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
                  <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                    {status}
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
                  <span className="financial-label">Total Principal (Original + Extra)</span>
                  <span className="financial-value">₹{interestData.totalPrincipalGiven.toLocaleString()}</span>
                </div>
                <div className="financial-row">
                  <span className="financial-label">Interest Accrued</span>
                  <span className="financial-value interest">₹{interestData.totalInterest.toLocaleString()}</span>
                </div>
                <div className="financial-row">
                  <span className="financial-label">Total Payments Received</span>
                  <span className="financial-value received">₹{interestData.totalPayments.toLocaleString()}</span>
                </div>
                <div className="financial-row total">
                  <span className="financial-label">Outstanding Balance</span>
                  <span className="financial-value">₹{interestData.currentOutstanding.toLocaleString()}</span>
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
          {((loan.payments && loan.payments.length > 0) || (loan.Payments && loan.Payments.length > 0)) && (
            <div className="details-card full-width">
              <div className="card-header">
                <FaHistory className="card-icon" />
                <h3>Payment History</h3>
              </div>
              <div className="card-content">
                <div className="payment-timeline">
                  {(loan.payments || loan.Payments || []).map((payment, index) => (
                    <div key={payment.id || index} className="payment-entry">
                      <div className="payment-date">
                        <div className="date-circle"></div>
                        <span>{new Date(payment.date || payment.Date).toLocaleDateString()}</span>
                      </div>
                      <div className="payment-details">
                        {(payment.partialPayment || payment.PartialPayment || 0) > 0 && (
                          <div className="payment-item received">
                            <div className="payment-type">Payment Received</div>
                            <div className="payment-amount">₹{(payment.partialPayment || payment.PartialPayment).toLocaleString()}</div>
                          </div>
                        )}
                        {(payment.extraLoan || payment.ExtraLoan || 0) > 0 && (
                          <div className="payment-item given">
                            <div className="payment-type">Extra Loan Given</div>
                            <div className="payment-amount">₹{(payment.extraLoan || payment.ExtraLoan).toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interest Breakdown */}
          {interestData.interestBreakdown && interestData.interestBreakdown.length > 0 && (
            <div className="details-card full-width">
              <div className="card-header">
                <FaPercentage className="card-icon" />
                <h3>Interest Calculation Breakdown</h3>
              </div>
              <div className="card-content">
                <div className="interest-breakdown">
                  {interestData.interestBreakdown.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      {(item.type === 'period' || item.type === 'current') && (
                        <div className="period-item">
                          <div className="period-dates">
                            {new Date(item.fromDate).toLocaleDateString()} - {new Date(item.toDate).toLocaleDateString()}
                            <span className="period-description"> ({item.months.toFixed(2)} months)</span>
                          </div>
                          <div className="period-details">
                            Principal: ₹{item.principal.toLocaleString()} × {loan.interestRate}% × {item.months.toFixed(2)} months = 
                            Interest: ₹{item.interest.toLocaleString()}
                          </div>
                        </div>
                      )}
                      {item.type === 'loan' && (
                        <div className="loan-item">
                          <strong>Loan Given on {new Date(item.date).toLocaleDateString()}: 
                          ₹{item.amount.toLocaleString()}</strong>
                          <div>{item.description}</div>
                          <div>Principal Amount: ₹{item.newPrincipal.toLocaleString()}</div>
                        </div>
                      )}
                      {item.type === 'extra_loan' && (
                        <div className="extra-loan-item">
                          <strong>Extra Loan on {new Date(item.date).toLocaleDateString()}: 
                          ₹{item.amount.toLocaleString()}</strong>
                          <div>{item.description}</div>
                          <div>New Principal for Interest: ₹{item.newPrincipal.toLocaleString()}</div>
                        </div>
                      )}
                      {item.type === 'payment' && (
                        <div className="payment-item-breakdown">
                          <strong>Payment on {new Date(item.date).toLocaleDateString()}: 
                          ₹{Math.abs(item.amount).toLocaleString()}</strong>
                          <div>{item.description}</div>
                          <div>Remaining Principal: ₹{item.newPrincipal.toLocaleString()}</div>
                        </div>
                      )}
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