
import React, { useState } from 'react';
import './CloseLoanModal.css';
import { FaLock } from 'react-icons/fa';

const CloseLoanModal = ({ loan, onClose, onSubmit }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!amountPaid || isNaN(amountPaid) || parseFloat(amountPaid) <= 0) {
      alert('Please enter a valid amount paid.');
      setIsSubmitting(false);
      return;
    }
    await onSubmit({
      loanId: loan.id,
      amountPaid: parseFloat(amountPaid),
      notes,
      closedDate: new Date().toISOString(),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="close-loan-modal-overlay">
      <div className="close-loan-modal-container">
        <div className="close-loan-modal-header">
          <span className="icon"><FaLock /></span>
          <h2>Close Loan #{loan.id}</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group">
            <label>Total Amount Paid (Principal + Interest)</label>
            <input
              type="number"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              min="0"
              step="0.01"
              required
              placeholder="Enter total paid by customer"
            />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any remarks about this closure..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>Close Loan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseLoanModal;
