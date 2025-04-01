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
        console.log('API Response:', data);
        setReorderProducts(data);
      } catch (error) {
        console.error('Error fetching reorder products:', error);
      }
    };

    fetchReorderProducts();
  }, []);

  const handleExport = (type) => {
    if (reorderProducts.length === 0) {
      alert('No data to export');
      return;
    }

    let content = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `reorders-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case 'CSV':
        content = convertToCSV(reorderProducts);
        break;
      case 'SQL':
        content = convertToSQL(reorderProducts);
        break;
      case 'TXT':
        content = convertToTXT(reorderProducts);
        break;
      case 'JSON':
        content = JSON.stringify(reorderProducts, null, 2);
        break;
      default:
        return;
    }

    downloadFile(content, filename, type === 'JSON' ? 'application/json' : 'text/plain');
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const convertToSQL = (data) => {
    const tableName = 'reorders';
    const columns = Object.keys(data[0]).join(', ');
    const values = data.map(obj => 
      `(${Object.values(obj).map(value => 
        typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value
      ).join(', ')})`
    ).join(',\n');
    
    return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
  };

  const convertToTXT = (data) => {
    return data.map(obj => 
      Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join('\n')
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
        </div>

           {/* Title & Export Buttons */}
           <div className="flex justify-between items-center mb-6">
            <div className="export-buttons flex flex-wrap gap-4">
              {['CSV', 'SQL', 'TXT', 'JSON'].map((type) => (
                <button 
                  key={type}
                  onClick={() => handleExport(type)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {`Export ${type}`}
                </button>
              ))}
            </div>
          </div>

        {/* Pagination */}
        <div className="pagination-container mt-6">
          <div className="pagination flex justify-center gap-2">
            {[1, 2, 3, 4, 5, '...', Math.ceil(reorderProducts.length / 10)].map((num, idx) => (
              <button 
                key={idx} 
                className={`pagination-button px-4 py-2 rounded ${num === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
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