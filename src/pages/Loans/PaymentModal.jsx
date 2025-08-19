import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { calculateLoanInterest, getCurrentBalance } from "../../utils/interestCalculator";
import "./PaymentModal.css";

const PaymentModal = ({ loan, onClose, onSubmit }) => {
  const [partialPayment, setPartialPayment] = useState("");
  const [extraLoan, setExtraLoan] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  // Calculate current loan details
  const interestData = calculateLoanInterest(loan);
  const currentBalance = getCurrentBalance(loan);

  const handleSubmit = () => {
    const paymentAmount = parseFloat(partialPayment || 0);
    const extraLoanAmount = parseFloat(extraLoan || 0);
    
    if (paymentAmount <= 0 && extraLoanAmount <= 0) {
      alert("Please enter either a partial payment amount or an extra loan amount.");
      return;
    }
    
    if (!paymentDate) {
      alert("Please select a transaction date.");
      return;
    }
    
    // Validate amounts
    if (paymentAmount < 0 || extraLoanAmount < 0) {
      alert("Amounts cannot be negative.");
      return;
    }
    
    // Validate date is not in the future
    const selectedDate = new Date(paymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > today) {
      alert("Payment date cannot be in the future.");
      return;
    }
    
    if (paymentAmount > interestData.currentOutstanding && paymentAmount > 0) {
      const confirmOverpayment = window.confirm(
        `Payment amount (₹${paymentAmount.toLocaleString()}) exceeds current balance (₹${interestData.currentOutstanding.toLocaleString()}). Do you want to continue?`
      );
      if (!confirmOverpayment) return;
    }

    onSubmit(loan.id, {
      partialPayment: paymentAmount,
      extraLoan: extraLoanAmount,
      date: paymentDate,
    });
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h3>Payment & Extra Loan - {loan.customerName}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="payment-modal-content">
          <div className="loan-summary">
            <div className="summary-item">
              <span className="label">Current Loan Amount:</span>
              <span className="value">₹{interestData.totalPrincipalGiven.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Accrued Interest:</span>
              <span className="value">₹{interestData.totalInterest.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current Balance:</span>
              <span className="value">₹{interestData.currentOutstanding.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Interest Rate:</span>
              <span className="value">{loan.interestRate}% per month</span>
            </div>
          </div>

          <div className="payment-form">
            <div className="form-group">
              <label>Transaction Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Partial Payment Received</label>
              <input
                type="number"
                placeholder="Enter amount received"
                value={partialPayment}
                onChange={(e) => setPartialPayment(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Extra Loan Given</label>
              <input
                type="number"
                placeholder="Enter additional loan amount"
                value={extraLoan}
                onChange={(e) => setExtraLoan(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="payment-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSubmit}>
              Save Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
