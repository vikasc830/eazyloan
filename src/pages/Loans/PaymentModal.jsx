import React, { useState } from "react";
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
        <h3>Loan Action - {loan.customerName}</h3>

        <div className="payment-input">
          <label>Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        <div className="payment-input">
          <label>Partial Payment Received</label>
          <input
            type="number"
            placeholder="₹ Amount"
            value={partialPayment}
            onChange={(e) => setPartialPayment(e.target.value)}
            min="0"
          />
        </div>

        <div className="payment-input">
          <label>Extra Loan Given</label>
          <input
            type="number"
            placeholder="₹ Amount"
            value={extraLoan}
            onChange={(e) => setExtraLoan(e.target.value)}
            min="0"
          />
        </div>

        <div className="payment-buttons">
          <button className="save-btn" onClick={handleSubmit}>
            Save
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
