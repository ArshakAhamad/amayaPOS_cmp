import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, subDays } from "date-fns";

const SalesProfit = () => {
  // Set default date range (last 30 days)
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const calculateProfitPercentage = (profit, cost) => {
    if (cost === 0) return 0;
    return (profit / cost) * 100;
  };

  // Default empty data structure
  const defaultData = {
    summary: {
      productSales: 0,
      voucherSales: 0,
      cost: 0,
      profit: 0,
      profitPercentage: 0,
    },
    receipts: [],
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const api = axios.create({
        baseURL: "http://localhost:5000/api",
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const response = await api.get("/sales", {
        params: {
          startDate: format(new Date(startDate), "yyyy-MM-dd"),
          endDate: format(new Date(endDate), "yyyy-MM-dd"),
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch data");
      }

      setData(response.data.data || defaultData);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load sales data"
      );
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after start date");
      return;
    }
    fetchData();
  };

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="main-content p-6 flex flex-col items-center">
      {/* Header */}
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">
        SALES
      </h2>

      {/* Date Pickers & Generate Button - Fixed Alignment */}
      <div className="sales-controls flex flex-wrap gap-4 items-center justify-center mb-6 w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mt-4">
        <label
          htmlFor="startDate"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Start Date
        </label>
        <br></br>
        <input
          type="date"
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={endDate}
        />
        <label
          htmlFor="endDate"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          End Date
        </label>
        <br></br>
        <input
          type="date"
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
          max={format(new Date(), "yyyy-MM-dd")}
        />
        <button
          className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-blue-300 transition"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {error && (
        <div className="w-full max-w-6xl mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="sales-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-6">
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow">
          <span className="icon text-3xl mb-2">🔖</span>
          <div>
            <p className="text-gray-700 font-medium">Product Sales</p>
            <h3 className="text-lg font-semibold">
              LKR {formatCurrency(data?.summary.productSales || 0)}
            </h3>
          </div>
        </div>

        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow">
          <span className="icon text-3xl mb-2">💰</span>
          <div>
            <p className="text-gray-700 font-medium">Voucher Sales</p>
            <h3 className="text-lg font-semibold">
              LKR {formatCurrency(data?.summary.voucherSales || 0)}
            </h3>
          </div>
        </div>

        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow">
          <span className="icon text-3xl mb-2">📦</span>
          <div>
            <p className="text-gray-700 font-medium">Cost</p>
            <h3 className="text-lg font-semibold">
              (LKR {formatCurrency(data?.summary.cost || 0)})
            </h3>
          </div>
        </div>

        <div
          className={`summary-card p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-2 hover:shadow-lg transition-shadow ${
            (data?.summary.profit || 0) >= 0
              ? "border-green-400"
              : "border-red-400"
          }`}
        >
          <span className="icon text-3xl mb-2">⚡</span>
          <div>
            <p className="text-gray-700 font-medium">
              Profit [{(data?.summary.profitPercentage || 0).toFixed(2)}%]
            </p>
            <h3
              className={`text-lg font-semibold ${
                (data?.summary.profit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              LKR {formatCurrency(data?.summary.profit || 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {/* Sales Table - Only show if there's data */}
      {data?.receipts && data.receipts.length > 0 ? (
        <div className="sales-table bg-white p-6 rounded-lg shadow-md overflow-x-auto w-full max-w-6xl mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Receipt Wise Sales
            </h3>
            <span className="text-sm text-gray-500">
              {data.receipts.length} records found
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Sale
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Percentage (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.receipts.map((receipt, index) => {
                  const profitPercentage = calculateProfitPercentage(
                    receipt.profit,
                    receipt.cost
                  );
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        {receipt.date}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        {receipt.type}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600 font-medium">
                        {receipt.reference}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        LKR {formatCurrency(receipt.sale)}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        LKR {formatCurrency(receipt.discount)}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        LKR {formatCurrency(receipt.cost)}
                      </td>
                      <td
                        className={`px-4 py-3 border-b text-sm font-medium ${
                          receipt.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        LKR {formatCurrency(receipt.profit)}
                      </td>
                      <td
                        className={`px-4 py-3 border-b text-sm ${
                          profitPercentage >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {profitPercentage.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        !loading && (
          <div className="w-full max-w-6xl mt-6 p-8 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-500 italic">
              No sales data found for the selected period
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default SalesProfit;
