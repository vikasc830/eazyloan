// src/pages/loans/LoanFormModal.jsx
import React, { useState, useEffect } from "react";
import "./LoanFormModal.css";

const LoanFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: "",
    customerName: "",
    fatherOrHusbandName: "",
    phone: "",
    aadhar: "",
    address: "",
    ornamentType: "gold",
    goldWeight: "",
    silverWeight: "",
    amount: "",
    estimationValue: "",
    loanDate: new Date().toISOString().slice(0, 10),
    status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        id: initialData.id || "",
        loanDate: initialData.loanDate || new Date().toISOString().slice(0, 10),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.amount || !formData.loanDate || !formData.id) {
      alert("Please fill out all required fields including Loan ID and Loan Date.");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const showGold = formData.ornamentType === "gold" || formData.ornamentType === "both";
  const showSilver = formData.ornamentType === "silver" || formData.ornamentType === "both";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialData?.id ? "Edit Loan" : "New Loan / Renewal"}</h3>
        <form onSubmit={handleSubmit} className="loan-form">
          <label>
            Loan ID
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={initialData?.id && initialData.status !== "Renewed"}
            />
          </label>

          <label>
            Customer Name
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Guardian Name
            <input
              type="text"
              name="fatherOrHusbandName"
              value={formData.fatherOrHusbandName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Aadhar
            <input
              type="text"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
            />
          </label>

          <label>
            Address
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </label>

          <label>
            Ornament Type
            <select
              name="ornamentType"
              value={formData.ornamentType}
              onChange={handleChange}
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="both">Both</option>
            </select>
          </label>

          {showGold && (
            <label>
              Gold Weight (gms)
              <input
                type="number"
                name="goldWeight"
                value={formData.goldWeight}
                onChange={handleChange}
              />
            </label>
          )}

          {showSilver && (
            <label>
              Silver Weight (gms)
              <input
                type="number"
                name="silverWeight"
                value={formData.silverWeight}
                onChange={handleChange}
              />
            </label>
          )}

          <label>
            Estimation Value
            <input
              type="number"
              name="estimationValue"
              value={formData.estimationValue}
              onChange={handleChange}
            />
          </label>

          <label>
            Loan Amount
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Loan Date
            <input
              type="date"
              name="loanDate"
              value={formData.loanDate}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanFormModal;
