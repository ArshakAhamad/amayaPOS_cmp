import React, { useState, useEffect } from 'react';

const POSExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [date, setDate] = useState('');
  const [expense, setExpense] = useState('');
  const [amount, setAmount] = useState('');
  const [createdBy, setCreatedBy] = useState('Admin'); // Default value for createdBy

  // Fetch expenses from the backend
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pos_expenses');
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/pos_expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, expense, amount, createdBy }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Expense added successfully!');
        // Refresh the expenses list
        const refreshResponse = await fetch('http://localhost:5000/api/pos_expenses');
        const refreshData = await refreshResponse.json();
        setExpenses(refreshData);
        // Clear the form
        setDate('');
        setExpense('');
        setAmount('');
      } else {
        alert('Failed to add expense.');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Server error. Please try again.');
    }
  };

  // Handle expense deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pos_expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Expense deleted successfully!');
        // Refresh the expenses list
        const refreshResponse = await fetch('http://localhost:5000/api/pos_expenses');
        const refreshData = await refreshResponse.json();
        setExpenses(refreshData);
      } else {
        alert('Failed to delete expense.');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="main-content p-6">
      {/* Form Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto mb-8">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-center mb-4">Record Expenses</h2>
          <h3 className="text-lg font-medium text-gray-600 text-center mb-2">Expenses Setup</h3>
          <p className="text-sm text-gray-500 text-center mb-6">You can record new expenses from here</p>

          {/* Expense Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="expense" className="block text-sm font-medium text-gray-700">Expense Details</label>
              <input
                type="text"
                id="expense"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className="mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter expense details"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (LKR)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
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
                  <tr key={expense.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{expense.date}</td>
                    <td className="px-4 py-3">{expense.expense}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{new Date(expense.created_date).toLocaleString()}</td>
                    <td className="px-4 py-3">{expense.created_by}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(expense.id)}
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

        {/* Pagination & Export Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-gray-700">Showing {expenses.length} of {expenses.length} entries</span>
          <div className="export-buttons flex flex-wrap gap-4">
            {['CSV', 'SQL', 'TXT', 'JSON'].map((type) => (
              <button key={type} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
                Export {type}
              </button>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-container mt-6">
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">1</button>
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">2</button>
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">3</button>
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">4</button>
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">5</button>
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">...</button>
          <button className="pagination-button px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Next</button>
        </div>
      </div>
    </div>
  );
};

export default POSExpenses;