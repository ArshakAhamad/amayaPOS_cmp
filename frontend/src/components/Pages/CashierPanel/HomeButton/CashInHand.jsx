import React from 'react';

const CashierCashInHand = () => {
  const cashierData = [
    { name: 'Niluka', sale: 0.00, cash: 0.00, card: 0.00, voucher: 0.00 },
    { name: 'Rajitha', sale: 0.00, cash: 0.00, card: 0.00, voucher: 0.00 },
    { name: 'Thisal', sale: 0.00, cash: 0.00, card: 0.00, voucher: 0.00 },
  ];

  return (
    <div className="main-content p-6 flex flex-col items-center">
      {/* Header */}
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">CASH IN HAND</h2>

      <div className="sales-controls flex flex-wrap gap-4 items-center justify-center mb-6 w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mt-4">
        <input 
          type="date" 
          className="date-picker p-3 border border-gray-300 rounded-lg text-sm w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
       <button className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Generate
        </button>
      </div>

      {/* Cashier Summary Cards */}
      <div className="cashier-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {cashierData.map((cashier, index) => (
          <div 
            key={index} 
            className="cashier-card p-6 bg-white rounded-lg shadow-lg border border-gray-200 text-center flex flex-col justify-between"
          >
            {/* Cashier Name */}
            <h3 className="text-lg font-bold mb-4 text-gray-800">{`Cashier: ${cashier.name}`}</h3>

            {/* Sales Details */}
            <div className="text-gray-700 text-sm space-y-2">
              <p>Sale: <span className="font-semibold">LKR {cashier.sale.toFixed(2)}</span></p>
              <p>Cash: <span className="font-semibold">LKR {cashier.cash.toFixed(2)}</span></p>
              <p>Card: <span className="font-semibold">LKR {cashier.card.toFixed(2)}</span></p>
              <p>Voucher: <span className="font-semibold">LKR {cashier.voucher.toFixed(2)}</span></p>
            </div>

            {/* Balance Details */}
            <div className="mt-5 bg-gray-100 p-4 rounded-md shadow-inner">
              <p className="text-blue-600 font-semibold">Start Balance: LKR 0.00</p>
              <p className="text-blue-600 font-semibold">Cash Sale: LKR 0.00</p>
              <p className="text-red-600 font-semibold">Expenses: LKR 0.00</p>
              <p className="text-red-600 font-semibold">Cash In Hand: LKR 0.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashierCashInHand;
