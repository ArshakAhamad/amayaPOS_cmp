import React, { useState } from "react";

const POSReturn = () => {
  const [products, setProducts] = useState([
    { date: "2024-05-06", product: "Overcoat Blouse", unitPrice: 1590, quantity: 1, total: 1590, stock: 6, status: "Returned & Settled" },
    { date: "2024-05-05", product: "T-SHIRT SL Red", unitPrice: 1190, quantity: 1, total: 1190, stock: 6, status: "Returned & Settled" },
  ]);

  const [selectedProduct, setSelectedProduct] = useState("");

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        
        {/* 🔷 Input Controls */}
        <div className="barcode-select-container">
          <input
            type="text"
            placeholder="Alt + A (Barcode)"
            className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
          />
          <select
            className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
            onChange={(e) => setSelectedProduct(e.target.value)}
            value={selectedProduct}
          >
            <option value="">Select Product</option>
            <option value="product1">Product 1</option>
            <option value="product2">Product 2</option>
          </select>
        </div>

        {/* 🔷 Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[15%]">Date</th>
                <th className="px-4 py-3 text-left w-[25%]">Product</th>
                <th className="px-4 py-3 text-right w-[15%]">Unit Price (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Quantity</th>
                <th className="px-4 py-3 text-right w-[15%]">Total (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Stock</th>
                <th className="px-4 py-3 text-left w-[20%]">Settle</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-red-600 font-semibold">{product.date}</td>
                    <td className="px-4 py-3">{product.product}</td>
                    <td className="px-4 py-3 text-right">{product.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">{product.quantity}</td>
                    <td className="px-4 py-3 font-bold text-red-500 text-right">{product.total.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-center font-semibold ${product.stock < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.stock.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{product.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 italic text-gray-500">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔷 Footer Controls */}
        <div className="flex justify-between items-center mt-6">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            New
          </button>
          <div className="flex items-center gap-4 text-xl font-semibold">
            <br></br>
            <span>Total:</span>
            <span className="text-blue-600 font-bold">45,000.00 LKR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSReturn;
