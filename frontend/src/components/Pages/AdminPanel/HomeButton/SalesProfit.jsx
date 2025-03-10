import React from 'react';

const SalesProfit = () => {
  return (
    <div className="main-content p-6 flex flex-col items-center">
      {/* Header */}
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">SALES</h2>

      {/* Date Pickers & Generate Button - Fixed Alignment */}
      <div className="sales-controls flex flex-wrap gap-4 items-center justify-center mb-6 w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mt-4">
        <input 
          type="date" 
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <input 
          type="date" 
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Generate
        </button>
      </div>

      {/* Summary Cards */}
      <div className="sales-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-6">
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <span className="icon text-3xl">🔖</span>
          <div>
            <p className="text-gray-700 font-medium">Product Sales</p>
            <h3 className="text-lg font-semibold">0.00</h3>
          </div>
        </div>
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <span className="icon text-3xl">💰</span>
          <div>
            <p className="text-gray-700 font-medium">Voucher Sales</p>
            <h3 className="text-lg font-semibold">0.00</h3>
          </div>
        </div>
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <span className="icon text-3xl">📦</span>
          <div>
            <p className="text-gray-700 font-medium">Cost</p>
            <h3 className="text-lg font-semibold">(0.00)</h3>
          </div>
        </div>
        <div className="summary-card profit-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center border-2 border-red-400">
          <span className="icon text-3xl">⚡</span>
          <div>
            <p className="text-gray-700 font-medium">Profit [0.00%]</p>
            <h3 className="profit-amount text-red-600 text-lg font-semibold">0.00</h3>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="sales-table bg-white p-6 rounded-lg shadow-md overflow-x-auto w-full max-w-6xl mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Receipt Wise Sales</h3>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3 text-left">Sale</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Cost</th>
              <th className="px-4 py-3 text-left">Profit</th>
              <th className="px-4 py-3 text-left">%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="9" className="text-center py-4 italic text-gray-500">No Data Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesProfit;
