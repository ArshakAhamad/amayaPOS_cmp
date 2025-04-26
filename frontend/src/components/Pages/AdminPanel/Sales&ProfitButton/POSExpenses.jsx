import React, { useState, useEffect } from "react";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const POSExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [date, setDate] = useState("");
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [createdBy, setCreatedBy] = useState("Admin");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch expenses from the backend
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/pos_expenses");
        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/pos_expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, expense, amount, createdBy }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Expense added successfully!");
        const refreshResponse = await fetch(
          "http://localhost:5000/api/pos_expenses"
        );
        const refreshData = await refreshResponse.json();
        setExpenses(refreshData);
        setDate("");
        setExpense("");
        setAmount("");
      } else {
        alert("Failed to add expense.");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Server error. Please try again.");
    }
  };

  // Handle expense deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/pos_expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Expense deleted successfully!");
        const refreshResponse = await fetch(
          "http://localhost:5000/api/pos_expenses"
        );
        const refreshData = await refreshResponse.json();
        setExpenses(refreshData);
      } else {
        alert("Failed to delete expense.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Server error. Please try again.");
    }
  };

  // Format currency with LKR symbol and commas
  const formatCurrency = (value) => {
    return typeof value === "number"
      ? `LKR ${Math.abs(value)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, "$&,")}${value < 0 ? " (-)" : ""}`
      : "N/A";
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="main-content p-6">Loading expenses...</div>;
  }

  if (error) {
    return <div className="main-content p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="main-content p-6">
      {/* Form Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto mb-8">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-center mb-4">
            Record Expenses
          </h2>
          <h3 className="text-lg font-medium text-gray-600 text-center mb-2">
            Expenses Setup
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            You can record new expenses from here
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Expense Date
              </label>
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
              <label
                htmlFor="expense"
                className="block text-sm font-medium text-gray-700"
              >
                Expense Description
              </label>
              <input
                type="text"
                id="expense"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className="mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter expense description"
                required
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount Paid (LKR)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

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
        {/* Export Buttons - Moved to top */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Expense Records</h2>
          <div className="export-buttons flex flex-wrap gap-2">
            {["CSV", "SQL", "TXT", "JSON"].map((type) => (
              <button
                key={type}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Export as {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Expense Date</th>
                <th className="px-4 py-3 text-left">Expense Description</th>
                <th className="px-4 py-3 text-left">Amount Paid (LKR)</th>
                <th className="px-4 py-3 text-left">Created Date</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">{expense.date}</td>
                    <td className="px-4 py-3">{expense.expense}</td>
                    <td
                      className={`px-4 py-3 font-bold ${
                        expense.amount < 0 ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(expense.created_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{expense.created_by}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        title="Delete expense"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 italic text-gray-500"
                  >
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-gray-700 text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, expenses.length)} of{" "}
            {expenses.length} entries
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="First page"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`w-10 h-10 rounded border text-sm ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="flex items-center px-2">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => paginate(totalPages)}
                className={`w-10 h-10 rounded border text-sm ${
                  currentPage === totalPages
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSExpenses;
