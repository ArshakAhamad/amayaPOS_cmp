import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import axios from 'axios';

const ProductList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError(response.data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle export functionality
  const handleExport = (type) => {
    if (filteredProducts.length === 0) {
      setError('No data to export');
      return;
    }

    let content = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `products-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case 'CSV':
        content = convertToCSV(filteredProducts);
        break;
      case 'SQL':
        content = convertToSQL(filteredProducts);
        break;
      case 'TXT':
        content = convertToTXT(filteredProducts);
        break;
      case 'JSON':
        content = JSON.stringify(filteredProducts, null, 2);
        break;
      default:
        return;
    }

    downloadFile(content, filename, type === 'JSON' ? 'application/json' : 'text/plain');
  };

  // Helper functions for export
  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(value => {
        if (value === null || value === undefined) return '';
        const val = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const convertToSQL = (data) => {
    if (data.length === 0) return '';
    const tableName = 'products';
    const columns = Object.keys(data[0]).join(', ');
    const values = data.map(obj => 
      `(${Object.values(obj).map(value => {
        if (value === null || value === undefined) return 'NULL';
        const val = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
      }).join(', ')})`
    ).join(',\n');
    
    return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
  };

  const convertToTXT = (data) => {
    return data.map(obj => 
      Object.entries(obj).map(([key, value]) => {
        const val = value === null || value === undefined ? 'N/A' : 
                   typeof value === 'object' ? JSON.stringify(value) : value.toString();
        return `${key}: ${val}`;
      }).join('\n')
    ).join('\n\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter and paginate products
  const filteredProducts = products.filter((product) =>
    product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.includes(searchQuery) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className={`main-content flex-1 ml-${isSidebarOpen ? '64' : '20'} transition-all duration-300`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
            <input
              type="text"
              className="p-2 border rounded w-64"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Product Details</h3>
            <div className="flex gap-4">
              <span>Entries per page : </span>
              <select 
                className="p-2 border rounded"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
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
                <tr className="bg-gray-200">
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
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => {
                    const rowIndex = (currentPage - 1) * entriesPerPage + index + 1;
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-2">{rowIndex}</td>
                        <td className="px-4 py-2">{product.product_name}</td>
                        <td className="px-4 py-2">{product.barcode}</td>
                        <td className="px-4 py-2">{product.category}</td>
                        <td className="px-4 py-2">{product.price?.toFixed(2) ?? 'N/A'}</td>
                        <td className="px-4 py-2">{product.discount?.toFixed(2) ?? 'N/A'}</td>
                        <td className="px-4 py-2">{product.last_cost?.toFixed(2) ?? 'N/A'}</td>
                        <td className="px-4 py-2">{product.avg_cost?.toFixed(2) ?? 'N/A'}</td>
                        <td className="px-4 py-2">{product.created_at}</td>
                        <td className="px-4 py-2">{product.created_by || 'Admin'}</td>
                        <td className="px-4 py-2">
                          <span className={`font-semibold ${
                            product.status === 'Active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {product.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-blue-600 hover:text-blue-800 transition">
                            <Pencil width={18} height={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="px-4 py-4 text-center text-gray-500">
                      {products.length === 0 ? 'No products found' : 'No products match your search'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p>
              Showing {paginatedProducts.length} of {filteredProducts.length} entries
            </p>
            <div className="export-buttons flex gap-4">
              {['CSV', 'SQL', 'TXT', 'JSON'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className="bg-blue-600 text-white p-2 rounded"
                  disabled={filteredProducts.length === 0}
                >
                  Export {type}
                </button>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container mt-4 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-button px-4 py-2 rounded-lg ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-4 py-2">...</span>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;