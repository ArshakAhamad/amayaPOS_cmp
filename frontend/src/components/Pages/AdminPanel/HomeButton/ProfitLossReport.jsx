import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ProfitLossReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Sample data
  const salesData = {
    productSales: 0.0,
    voucherSales: 0.0,
    costDiscounts: 0.0,
    expenses: 0.0,
    profitLoss: 0.0,
  };

  return (
    <div className="main-content p-6">
     <h2 className="sales-header text-2xl font-semibold text-center mb-6">SALES</h2>

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

      {/* Report Summary Cards */}
      <div className="sales-summary mb-6">
        <div className="summary-card">
          <span className="icon">🔖</span>
          <div>
            <p>Product Sales</p>
            <h3>{salesData.productSales.toFixed(2)}</h3>
          </div>
        </div>
        <div className="summary-card">
          <span className="icon">💰</span>
          <div>
            <p>Voucher Sales</p>
            <h3>{salesData.voucherSales.toFixed(2)}</h3>
          </div>
        </div>
        <div className="summary-card">
          <span className="icon">📦</span>
          <div>
            <p>Cost & Discounts</p>
            <h3>{salesData.costDiscounts.toFixed(2)}</h3>
          </div>
        </div>
        <div className="summary-card profit-card">
          <span className="icon">⚡</span>
          <div>
            <p>Profit [0.00%]</p>
            <h3 className="profit-amount">{salesData.profitLoss.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="sales-table">
        <h3 className="text-lg font-bold mb-4">Receipt Wise Sales</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Expense</th>
              <th>Amount</th>
              <th>Created Date</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="empty-message">No Data Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitLossReport;
