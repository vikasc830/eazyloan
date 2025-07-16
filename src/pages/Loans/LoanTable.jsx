import React from "react";

const mockLoans = [
  {
    id: 1,
    customerName: "Ravi Kumar",
    amount: "₹40,000",
    ornaments: "Gold - 20g",
    date: "2025-07-12",
    status: "Active",
  },
  // Add more rows...
];

const LoanTable = ({ onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase">
          <tr>
            <th className="p-3">Customer</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Ornaments</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockLoans.map((loan) => (
            <tr key={loan.id} className="hover:bg-gray-50">
              <td className="p-3">{loan.customerName}</td>
              <td className="p-3">{loan.amount}</td>
              <td className="p-3">{loan.ornaments}</td>
              <td className="p-3">{loan.date}</td>
              <td className="p-3">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  {loan.status}
                </span>
              </td>
              <td className="p-3 space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => onEdit(loan)}
                >
                  Edit
                </button>
                <button className="text-yellow-600 hover:underline">Renew</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanTable;
