import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../../../../../backend/models/api";

const CashInHand = () => {
  const [cashierData, setCashierData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formattedToday = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchCashierData(formattedToday);
  }, []);

  const fetchCashierData = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/cashiers/summary", {
        params: { date },
        timeout: 10000,
      });

      if (response.data.success) {
        setCashierData(response.data.data || []);
      } else {
        setError(response.data.message || "No data available");
      }
    } catch (err) {
      let errorMessage = "Failed to fetch data";

      if (err.response) {
        if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.response.status === 401) {
          errorMessage = "Session expired. Redirecting to login...";
          setTimeout(() => (window.location.href = "/login"), 2000);
        } else {
          errorMessage =
            err.response.data?.message || `Error: ${err.response.status}`;
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Server is not responding.";
      } else {
        errorMessage = err.message || "Network error";
      }

      setError(errorMessage);
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
    } else {
      fetchCashierData(formattedToday);
    }
  };

  return (
    <div className="main-content p-6 flex flex-col items-center">
      <div className="sales-controls flex flex-wrap gap-4 items-center justify-center mb-6 w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mt-4">
        <input
          type="date"
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={selectedDate}
          onChange={handleDateChange}
          max={formattedToday}
        />
        <button
          className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-blue-300"
          onClick={handleGenerate}
          disabled={loading}
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
        <div className="w-full max-w-6xl mb-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            {(error.includes("expired") || error.includes("login")) && (
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 text-blue-600 hover:underline"
              >
                Go to login page
              </button>
            )}
          </div>
        </div>
      )}

      <div className="cashier-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {cashierData.length > 0
          ? cashierData.map((cashier, index) => (
              <div
                key={index}
                className="cashier-card p-6 bg-white rounded-lg shadow-lg border border-gray-200 text-center flex flex-col justify-between"
              >
                <h3 className="text-lg font-bold mb-4 text-gray-800">{`Cashier: ${cashier.name}`}</h3>

                <div className="text-gray-700 text-sm space-y-2">
                  <p>
                    Sale:{" "}
                    <span className="font-semibold">
                      LKR {cashier.sale.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Cash:{" "}
                    <span className="font-semibold">
                      LKR {cashier.cash.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Card:{" "}
                    <span className="font-semibold">
                      LKR {cashier.card.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Voucher:{" "}
                    <span className="font-semibold">
                      LKR {cashier.voucher.toFixed(2)}
                    </span>
                  </p>
                </div>

                <div className="mt-5 bg-gray-100 p-4 rounded-md shadow-inner">
                  <p className="text-blue-600 font-semibold">
                    Start Balance: LKR 0.00
                  </p>
                  <p className="text-blue-600 font-semibold">
                    Cash Sale: LKR {cashier.cash.toFixed(2)}
                  </p>
                  <p className="text-red-600 font-semibold">
                    Expenses: LKR 0.00
                  </p>
                  <p className="text-red-600 font-semibold">
                    Cash In Hand: LKR {cashier.cash.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          : !loading &&
            !error && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No cashier data available</p>
              </div>
            )}
      </div>
    </div>
  );
};

export default CashInHand;
