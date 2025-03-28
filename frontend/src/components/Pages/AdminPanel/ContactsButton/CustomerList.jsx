import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Pencil } from 'lucide-react';

const CustomerList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        if (response.data.success) {
          setCustomers(response.data.customers);
        } else {
          setError(response.data.message || 'Failed to fetch customers.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching customer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle export functionality
  const handleExport = (type) => {
    if (filteredCustomers.length === 0) {
      setError('No data to export');
      return;
    }

    let content = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `customers-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case 'CSV':
        content = convertToCSV(filteredCustomers);
        break;
      case 'SQL':
        content = convertToSQL(filteredCustomers);
        break;
      case 'TXT':
        content = convertToTXT(filteredCustomers);
        break;
      case 'JSON':
        content = JSON.stringify(filteredCustomers, null, 2);
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
    const tableName = 'customers';
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

  // Filter and paginate customers
  const filteredCustomers = customers.filter((customer) =>
    customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_phone?.includes(searchQuery) ||
    customer.customer_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / entriesPerPage);
  const paginatedCustomers = filteredCustomers.slice(
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
          {/* Title Section */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Manage Customer</h2>
          </div>

          {/* Controls Section */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Customer Details</h3>
            <div className="barcode-select-container flex items-center gap-4">
              <span>Entries per page:</span>
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
              <div className="relative">
                <input
                  type="text"
                  className="p-2 border rounded w-64"
                  placeholder="Search...🔍"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">No</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer, index) => {
                    const rowIndex = (currentPage - 1) * entriesPerPage + index + 1;
                    return (
                      <tr key={customer.customer_id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-2">{rowIndex}</td>
                        <td className="px-4 py-2">{customer.customer_name}</td>
                        <td className="px-4 py-2">{customer.customer_phone}</td>
                        <td className="px-4 py-2">{customer.customer_address}</td>
                        <td className="px-4 py-2">
                          <span className={`font-semibold ${
                            customer.customer_active === 1 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {customer.customer_active === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Link 
                            to={`/customers/edit/${customer.customer_id}`}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Pencil width={15} height={15} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                      {customers.length === 0 ? 'No customers found' : 'No customers match your search'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Export */}
          <div className="mt-4 flex justify-between items-center">
            <p>Showing {paginatedCustomers.length} of {filteredCustomers.length} entries</p>
            <div className="export-buttons flex gap-4">
              {['CSV', 'SQL', 'TXT', 'JSON'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className="bg-blue-600 text-white p-2 rounded"
                  disabled={filteredCustomers.length === 0}
                >
                  Export {type}
                </button>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
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
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-1">...</span>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
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

export default CustomerList;