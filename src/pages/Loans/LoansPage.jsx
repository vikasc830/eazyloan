import React, { useState } from "react";
import LoanTable from "./LoanTable";
import LoanFormModal from "./LoanFormModal";

const LoansPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const handleAddLoan = () => {
    setEditingLoan(null);
    setShowModal(true);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Loan Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={handleAddLoan}
        >
          + Add New Loan
        </button>
      </div>

      <LoanTable onEdit={handleEditLoan} />

      {showModal && (
        <LoanFormModal
          loan={editingLoan}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default LoansPage;
