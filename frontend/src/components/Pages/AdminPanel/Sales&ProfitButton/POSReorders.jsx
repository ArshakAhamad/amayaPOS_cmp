import React, { useState, useEffect } from 'react';

const POSReorders = () => {
  const [reorderProducts, setReorderProducts] = useState([]);

  // Fetch reorder products from the backend
  useEffect(() => {
    const fetchReorderProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reorders');
        if (!response.ok) {
          throw new Error('Failed to fetch reorder products');
        }
        const data = await response.json();
        console.log('API Response:', data); // Log the API response
        setReorderProducts(data);
      } catch (error) {
        console.error('Error fetching reorder products:', error);
      }
    };

    fetchReorderProducts();
  }, []);

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
                <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{product.product}</td>
                  <td className="px-4 py-3">{product.saleQtyLast30Days}</td>
                  <td className="px-4 py-3">
                    {typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {typeof product.lastPurchasedPrice === 'number' ? product.lastPurchasedPrice.toFixed(2) : 'N/A'}
                  </td>
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