import React, { useState } from "react";

const ProductMovement = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Sample Data
  const productMovementData = [
    {
      date: "2024-12-01",
      type: "Sale",
      reference: "REF123",
      product: "Product A",
      price: 100.0,
      cost: 50.0,
      productIn: 10,
      productOut: 5,
      returnId: "RET123",
      inventory: 5,
    },
  ];

  const salesData = {
    productSales: 0.0,
    voucherSales: 0.0,
    costDiscounts: 0.0,
    expenses: 0.0,
    profitLoss: 0.0,
  };

  return (
    <div className="main-content p-6">
      {/* Header */}
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">
        PRODUCT MOVEMENT
      </h2>

      {/* Date Pickers & Generate Button */}
      <div className="sales-controls flex flex-wrap gap-4 items-center justify-between mb-6">
        <input
          type="date"
          className="date-picker p-3 border rounded-lg text-sm w-full sm:w-auto"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="date-picker p-3 border rounded-lg text-sm w-full sm:w-auto"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Generate
        </button>
      </div>

      {/* Report Summary Cards */}
      <div className="sales-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between">
          <span className="icon text-xl">🔖</span>
          <div>
            <p className="text-sm">Price</p>
            <h3 className="text-lg">{salesData.productSales.toFixed(2)}</h3>
          </div>
        </div>
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between">
          <span className="icon text-xl">💰</span>
          <div>
            <p className="text-sm">Discounts</p>
            <h3 className="text-lg">{salesData.voucherSales.toFixed(2)}</h3>
          </div>
        </div>
        <div className="summary-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between">
          <span className="icon text-xl">📦</span>
          <div>
            <p className="text-sm">Cost</p>
            <h3 className="text-lg">{salesData.costDiscounts.toFixed(2)}</h3>
          </div>
        </div>
        <div className="summary-card profit-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between border-2 border-red-400">
          <span className="icon text-xl">⚡</span>
          <div>
            <p className="text-sm">Profit [0.00%]</p>
            <h3 className="profit-amount text-red-600 text-lg">
              {salesData.profitLoss.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* Product Movement Table */}
      <div className="sales-table bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Product Movement</h3>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Cost</th>
              <th className="px-4 py-3 text-left">Product In</th>
              <th className="px-4 py-3 text-left">Product Out</th>
              <th className="px-4 py-3 text-left">Return ID</th>
              <th className="px-4 py-3 text-left">Inventory</th>
            </tr>
          </thead>
          <tbody>
            {productMovementData.length > 0 ? (
              productMovementData.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.type}</td>
                  <td className="px-4 py-2">{row.reference}</td>
                  <td className="px-4 py-2">{row.product}</td>
                  <td className="px-4 py-2">{row.price}</td>
                  <td className="px-4 py-2">{row.cost}</td>
                  <td className="px-4 py-2">{row.productIn}</td>
                  <td className="px-4 py-2">{row.productOut}</td>
                  <td className="px-4 py-2">{row.returnId}</td>
                  <td className="px-4 py-2">{row.inventory}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 italic text-gray-500">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductMovement;
