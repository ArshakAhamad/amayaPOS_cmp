import React, { useState } from 'react';
import { Pencil } from 'lucide-react';

const ProductList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [products, setProducts] = useState([
    {
      id: 1,
      product: 'Mascara',
      barcode: 'BC-001',
      category: 'Cotton',
      type: 'Voucher',
      price: 1250.0,
      discount: 0.0,
      lastCost: 1000.0,
      avgCost: 1000.0,
      createdDate: '2024-05-06 15:51:35',
      createdBy: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      product: 'Lipstick',
      barcode: 'BC-002',
      category: 'Cosmetics',
      type: 'Voucher',
      price: 1500.0,
      discount: 10.0,
      lastCost: 1200.0,
      avgCost: 1300.0,
      createdDate: '2024-05-07 10:15:20',
      createdBy: 'Admin',
      status: 'Inactive',
    },
    // Add more products here
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className={`main-content flex-1 ml-${isSidebarOpen ? '64' : '20'} transition-all duration-300`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Product Details</h3>
            <div className="flex gap-4">
              <span>Entries per page : </span>
              <select className="p-2 border rounded">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">No</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Barcode</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Discount (%)</th>
                  <th className="px-4 py-2 text-left">Last Cost</th>
                  <th className="px-4 py-2 text-left">Avg Cost</th>
                  <th className="px-4 py-2 text-left">Created Date</th>
                  <th className="px-4 py-2 text-left">Created By</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th> {/* Added Actions Column */}
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{product.product}</td>
                    <td className="px-4 py-2">{product.barcode}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">{product.price.toFixed(2)}</td>
                    <td className="px-4 py-2">{product.discount.toFixed(2)}</td>
                    <td className="px-4 py-2">{product.lastCost.toFixed(2)}</td>
                    <td className="px-4 py-2">{product.avgCost.toFixed(2)}</td>
                    <td className="px-4 py-2">{product.createdDate}</td>
                    <td className="px-4 py-2">{product.createdBy}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`font-semibold ${
                          product.status === 'Active' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button className="text-blue-600 hover:text-blue-800 transition">
                        <Pencil width={18} height={18} /> {/* Edit Icon */}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p>
              Showing 1 to {products.length} of {products.length} entries
            </p>
            <div className="export-buttons flex gap-4">
              <button className="bg-blue-600 text-white p-2 rounded">Export CSV</button>
              <button className="bg-blue-600 text-white p-2 rounded">Export SQL</button>
              <button className="bg-blue-600 text-white p-2 rounded">Export TXT</button>
              <button className="bg-blue-600 text-white p-2 rounded">Export JSON</button>
            </div>
          </div>

          {/* Pagination */}
          <div className="pagination-container mt-4 flex justify-center gap-2">
            <button className="pagination-button px-4 py-2 rounded-lg bg-blue-600 text-white">1</button>
            <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">2</button>
            <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">3</button>
            <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;