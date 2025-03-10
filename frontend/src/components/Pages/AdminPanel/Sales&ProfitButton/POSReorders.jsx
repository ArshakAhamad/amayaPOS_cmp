import React, { useState } from 'react';

const POSReorders = () => {
  const [reorderProducts, setReorderProducts] = useState([
    {
      product: 'Product 1',
      saleQtyLast30Days: 100,
      price: 1500.0,
      lastPurchasedPrice: 1400.0,
      minimumStock: 50,
      currentStock: 20,
    },
    {
      product: 'Product 2',
      saleQtyLast30Days: 200,
      price: 1200.0,
      lastPurchasedPrice: 1100.0,
      minimumStock: 30,
      currentStock: 15,
    },
  ]);

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
      
        {/* Table Section */}
        <div className="overflow-x-auto">
        <h2 className="text-2xl font-semibold">Reorders</h2>
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Sale Qty (Last 30 Days)</th>
                <th className="px-4 py-3 text-left">Price (LKR)</th>
                <th className="px-4 py-3 text-left">Last Purchased Price (LKR)</th>
                <th className="px-4 py-3 text-left">Minimum Stock</th>
                <th className="px-4 py-3 text-left">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {reorderProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{product.product}</td>
                  <td className="px-4 py-3">{product.saleQtyLast30Days}</td>
                  <td className="px-4 py-3">{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{product.lastPurchasedPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">{product.minimumStock}</td>
                  <td className={`px-4 py-3 font-semibold ${product.currentStock < product.minimumStock ? 'text-red-600' : 'text-gray-700'}`}>
                    {product.currentStock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Title & Export Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="export-buttons flex flex-wrap gap-4">
            {['CSV', 'SQL', 'TXT', 'JSON'].map((type) => (
              <button key={type}>{`Export ${type}`}</button>
            ))}
          </div>
        </div>
        </div>

       {/* Pagination */}
<div className="pagination-container">
  <div className="pagination">
    {[1, 2, 3, 4, 5, '...', Math.ceil(reorderProducts.length / 1)].map((num, idx) => (
      <button key={idx} className="pagination-button">
        {num}
      </button>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};

export default POSReorders;
