import React, { useState } from 'react';

const POSExpenses = () => {
  const [expenses, setExpenses] = useState([
    { date: '2024-05-06', expense: 'Saman Aiya', amount: 200, createdDate: '2024-05-06 15:51:35', createdBy: 'Rajitha' },
    { date: '2024-05-06', expense: 'Wheel Hire', amount: 300, createdDate: '2024-05-06 15:51:35', createdBy: 'Rajitha' },
    { date: '2024-05-06', expense: 'Saman Aiya', amount: 300, createdDate: '2024-05-06 15:51:35', createdBy: 'Rajitha' },
    { date: '2024-05-06', expense: 'Book Shop', amount: 40, createdDate: '2024-05-06 15:51:35', createdBy: 'Rajitha' },
  ]);

  const handleDelete = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        
        {/* Title & Form */}
        <h2 className="text-2xl font-semibold mb-2">Record Expenses</h2>
        <h3 className="text-lg font-semibold">Expenses Setup</h3>
        <p className="text-sm text-gray-500 mb-4">You can record new expenses from here</p>

        {/* Expense Form */}
        <div className="barcode-select-container">
          <input type="date" className="p-3 border rounded-lg w-full sm:w-auto" />
          <input type="text" className="p-3 border rounded-lg w-full sm:w-auto" placeholder="Amount (LKR)" />
          <input type="text" className="p-3 border rounded-lg w-full sm:w-auto" placeholder="Details" />
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Expense</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Created Date</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Remove</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((expense, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{expense.date}</td>
                    <td className="px-4 py-3">{expense.expense}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{expense.createdDate}</td>
                    <td className="px-4 py-3">{expense.createdBy}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 italic text-gray-500">No Data Available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
<br></br>
        {/* Pagination & Export Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-gray-700">Showing {expenses.length} of {expenses.length} entries</span>
          <div className="export-buttons flex flex-wrap gap-4">
            {['CSV', 'SQL', 'TXT', 'JSON'].map((type) => (
              <button key={type}>{`Export ${type}`}</button>
            ))}
          </div>
        </div>
<br></br>
        {/* Pagination Controls */}
        <div className="pagination-container">
  <button className="pagination-button">1</button>
  <button className="pagination-button">2</button>
  <button className="pagination-button">3</button>
  <button className="pagination-button">4</button>
  <button className="pagination-button">5</button>
  <button className="pagination-button">...</button>
  <button className="pagination-button">Next</button>
</div>


      </div>
    </div>
  );
};

export default POSExpenses;
