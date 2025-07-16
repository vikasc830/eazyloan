import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./PaymentModal.css";

const PaymentModal = ({ loan, onClose, onSubmit }) => {
  const [partialPayment, setPartialPayment] = useState("");
  const [extraLoan, setExtraLoan] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    if (!partialPayment && !extraLoan) {
      alert("Please enter either a partial payment or an extra loan.");
      return;
    }

    onSubmit(loan.id, {
      partialPayment: parseFloat(partialPayment || 0),
      extraLoan: parseFloat(extraLoan || 0),
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
              <span className="value">₹{parseFloat(loan.loanAmount).toLocaleString()}</span>
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
