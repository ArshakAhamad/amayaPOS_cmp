import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import api from "../../../../../../backend/models/api";
import { toast } from "react-toastify";

const CashInHand = () => {
  const [cashierData, setCashierData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default date to today on component mount
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    fetchCashierData(today);
  }, []);

  const fetchCashierData = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/cashiers/summary", {
        params: { date },
        timeout: 10000,
      });

      console.log("API Response:", response.data);

      if (response.data.success) {
        if (response.data.data && response.data.data.length > 0) {
          setCashierData(response.data.data);
          toast.success(
            `Data loaded for ${format(parseISO(date), "MMM dd, yyyy")}`
          );
        } else {
          setCashierData([]);
          toast.info("No cashier data available for selected date");
        }
      } else {
        throw new Error(response.data.message || "Failed to load data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
      setCashierData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleGenerate = () => {
    if (selectedDate) {
      fetchCashierData(selectedDate);
    }
  };

  const calculateCashInHand = (cashier) => {
    return cashier.opening_balance + cashier.cash - cashier.expenses;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <div className="w-full sm:w-64">
            <label
              htmlFor="report-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Date
            </label>{" "}
            <input
              id="report-date"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate}
              onChange={handleDateChange}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedDate}
            className="mt-6 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cashier-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {cashierData.length > 0
          ? cashierData.map((cashier) => (
              <div
                key={cashier.id}
                className="cashier-card p-6 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col"
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 text-center">
                    {cashier.name}
                  </h3>
                </div>

                {/* Sales Breakdown */}
                <div className="mb-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium">
                      LKR {cashier.sale.toFixed(2)}
                    </span>
                  </div>
                  <br></br>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Payments:</span>
                    <span className="font-medium">
                      LKR {cashier.cash.toFixed(2)}
                    </span>
                  </div>
                  <br></br>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card Payments:</span>
                    <span className="font-medium">
                      LKR {cashier.card.toFixed(2)}
                    </span>
                  </div>
                  <br></br>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vouchers Used:</span>
                    <span className="font-medium">
                      LKR {cashier.voucher.toFixed(2)}
                    </span>
                  </div>
                </div>
                <br></br>

                {/* Cash Flow Summary */}
                <div className="mt-auto bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between py-1">
                    <span className="text-blue-600 font-medium">
                      Opening Balance:
                    </span>
                    <span className="text-blue-600 font-medium">
                      LKR {cashier.opening_balance.toFixed(2)}
                    </span>
                  </div>
                  <br></br>
                  <div className="flex justify-between py-1">
                    <span className="text-blue-600 font-medium">
                      Cash Received:
                    </span>
                    <span className="text-blue-600 font-medium">
                      LKR {cashier.cash.toFixed(2)}
                    </span>
                  </div>
                  <br></br>
                  <div className="flex justify-between py-1">
                    <span className="text-red-600 font-medium">Expenses:</span>
                    <span className="text-red-600 font-medium">
                      LKR {cashier.expenses.toFixed(2)}
                    </span>
                  </div>
                  <br></br>
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                    <span className="font-bold">Cash In Hand:</span>
                    <span className="font-bold text-green-600">
                      LKR{" "}
                      {(
                        cashier.opening_balance +
                        cashier.cash -
                        cashier.expenses
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          : !loading &&
            !error && (
              <div className="col-span-full text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-500">No cashier data available</p>
              </div>
            )}
      </div>
    </div>
  );
};

export default CashInHand;
