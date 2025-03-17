import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import axios from 'axios';

const ProductList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
              {products.map((product, index) => (
  <tr key={product.id} className="border-b hover:bg-gray-50 transition">
    <td className="px-4 py-2">{index + 1}</td>
    <td className="px-4 py-2">{product.product_name}</td>
    <td className="px-4 py-2">{product.barcode}</td>
    <td className="px-4 py-2">{product.category}</td>
    <td className="px-4 py-2">{product.price?.toFixed(2)}</td>
    <td className="px-4 py-2">{product.discount?.toFixed(2)}</td>
    <td className="px-4 py-2">{product.last_cost?.toFixed(2) ?? 'N/A'}</td>
    <td className="px-4 py-2">{product.avg_cost?.toFixed(2) ?? 'N/A'}</td>
    <td className="px-4 py-2">{product.created_at}</td>
    <td className="px-4 py-2">{product.created_by || 'Admin'}</td>
    <td className="px-4 py-2">
      <span
        className={`font-semibold ${
          product.status === 'Active' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {product.status || 'Active'}
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