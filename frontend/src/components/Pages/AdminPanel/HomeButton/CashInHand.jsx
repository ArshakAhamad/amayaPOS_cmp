import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const CashInHand = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cashierData, setCashierData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cashier data from the API
  const fetchCashierData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/cashier_summary', {
        params: { date: selectedDate }
      });

      console.log('API Response:', response); // Log response

      if (response.data.success) {
        setCashierData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Call fetchCashierData when selectedDate changes
  useEffect(() => {
    fetchCashierData();
  }, [selectedDate]);

  // Handle date input change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchCashierData();
  };

  return (
    <div className="main-content p-6 flex flex-col items-center">
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">CASH IN HAND</h2>

      {/* Controls to select date and refresh data */}
      <div className="sales-controls flex flex-wrap gap-4 items-center justify-center mb-6 w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mt-4">
        <input 
          type="date" 
          value={selectedDate}
          onChange={handleDateChange}
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className={`generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {/* Display error message if exists */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-6xl">
          <p>{error}</p>
        </div>
      )}

      {/* Display cashier summary cards */}
      <div className="cashier-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {cashierData.length > 0 ? (
          cashierData.map((cashier, index) => (
            <div 
              key={index} 
              className="cashier-card p-6 bg-white rounded-lg shadow-lg border border-gray-200 text-center flex flex-col justify-between"
            >
              <h3 className="text-lg font-bold mb-4 text-gray-800">{`Cashier: ${cashier.name}`}</h3>

              {/* Sales details */}
              <div className="text-gray-700 text-sm space-y-2">
                <p>Sale: <span className="font-semibold">LKR {cashier.sale.toFixed(2)}</span></p>
                <p>Cash: <span className="font-semibold">LKR {cashier.cash.toFixed(2)}</span></p>
                <p>Card: <span className="font-semibold">LKR {cashier.card.toFixed(2)}</span></p>
                <p>Voucher: <span className="font-semibold">LKR {cashier.voucher.toFixed(2)}</span></p>
              </div>

              {/* Balance details */}
              <div className="mt-5 bg-gray-100 p-4 rounded-md shadow-inner">
                <p className="text-blue-600 font-semibold">Start Balance: LKR 0.00</p>
                <p className="text-blue-600 font-semibold">Cash Sale: LKR {cashier.cash.toFixed(2)}</p>
                <p className="text-red-600 font-semibold">Expenses: LKR 0.00</p>
                <p className="text-green-600 font-semibold">Cash In Hand: LKR {cashier.cash.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500">{loading ? 'Loading cashier data...' : 'No cashier data available'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashInHand;
