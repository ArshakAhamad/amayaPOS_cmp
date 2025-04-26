import React, { useState } from "react";

const ProfitLossReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState({
    summary: {
      productSales: 0,
      voucherSales: 0,
      costDiscounts: 0,
      expenses: 0,
      profitLoss: 0,
    },
    receipts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatNumber = (value) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  const handleGenerate = async () => {
    setError(null);
    if (!startDate || !endDate) {
      setError("Please select both dates");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/profitLoss?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Request failed");
      }

      setReportData({
        summary: {
          productSales: Number(data.productSales) || 0,
          voucherSales: Number(data.voucherSales) || 0,
          costDiscounts: Number(data.costDiscounts) || 0,
          expenses: Number(data.expenses) || 0,
          profitLoss: Number(data.profitLoss) || 0,
        },
        receipts: data.receipts || [],
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setReportData({
        summary: {
          productSales: 0,
          voucherSales: 0,
          costDiscounts: 0,
          expenses: 0,
          profitLoss: 0,
        },
        receipts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const profitPercentage =
    reportData.summary.productSales > 0
      ? (
          (reportData.summary.profitLoss / reportData.summary.productSales) *
          100
        ).toFixed(2)
      : "0.00";

  return (
    <div className="main-content p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            ×
          </button>
        </div>
      )}

      <div className="sales-controls flex flex-wrap gap-4 items-center justify-center mb-6 w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mt-4">
        <label
          htmlFor="startDate"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Start Date
        </label>
        <input
          type="date"
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={endDate}
        />
        <bt></bt>
        <label
          htmlFor="endDate"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          End Date
        </label>
        <input
          type="date"
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
        />
        <button
          className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-blue-300"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="sales-summary mb-6">
        <div className="summary-card">
          <span className="icon">🔖</span>
          <div>
            <p>Product Sales</p>
            <h3>{formatNumber(reportData.summary.productSales)}</h3>
          </div>
        </div>
        <div className="summary-card">
          <span className="icon">💰</span>
          <div>
            <p>Voucher Sales</p>
            <h3>{formatNumber(reportData.summary.voucherSales)}</h3>
          </div>
        </div>
        <div className="summary-card">
          <span className="icon">📦</span>
          <div>
            <p>Cost & Discounts</p>
            <h3>{formatNumber(reportData.summary.costDiscounts)}</h3>
          </div>
        </div>
        <div className="summary-card profit-card">
          <span className="icon">⚡</span>
          <div>
            <p>Profit [{profitPercentage}%]</p>
            <h3
              className={`profit-amount ${
                reportData.summary.profitLoss >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatNumber(reportData.summary.profitLoss)}
            </h3>
          </div>
        </div>
      </div>

      {/* Receipt Table */}
      <div className="sales-table bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold">Receipt Wise Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.receipts.length > 0 ? (
                reportData.receipts.map((receipt, index) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receipt.receipt_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(receipt.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {receipt.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.created_by || "System"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {loading
                      ? "Loading receipts..."
                      : "No receipts found for selected period"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
