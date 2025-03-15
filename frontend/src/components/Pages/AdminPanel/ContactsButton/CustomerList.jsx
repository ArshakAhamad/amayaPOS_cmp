import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests
import { Pencil } from 'lucide-react';

const CustomerList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]); // State to store customer data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(''); // State for error message

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Fetch customer data from the backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        if (response.data.success) {
          setCustomers(response.data.customers);
        } else {
          setError('Failed to fetch customers.');
        }
      } catch (err) {
        setError('An error occurred while fetching customer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_phone.includes(searchQuery) ||
    customer.customer_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>; // Display loading state while fetching data
  if (error) return <div>{error}</div>; // Display error message if any

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className={`main-content flex-1 ml-${isSidebarOpen ? '64' : '20'} transition-all duration-300`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Manage Customer</h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Customer Details</h3>
            <div className="barcode-select-container flex items-center gap-4">
              <span>Entries per page:</span>
              <select className="p-2 border rounded">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  className="p-2 border rounded w-64"
                  placeholder="Search...🔍"
                  value={searchQuery}
                  onChange={handleSearchChange}
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
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.customer_id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{customer.customer_name}</td>
                    <td className="px-4 py-2">{customer.customer_phone}</td>
                    <td className="px-4 py-2">{customer.customer_address}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`font-semibold ${
                          customer.customer_active === 1 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {customer.customer_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button className="text-blue-600 hover:text-blue-800 transition">
                        <Pencil width={15} height={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p>Showing {filteredCustomers.length} of {customers.length} entries</p>
            <div className="export-buttons flex gap-4">
              <button className="bg-blue-600 text-white p-2 rounded">Export CSV</button>
              <button className="bg-blue-600 text-white p-2 rounded">Export SQL</button>
              <button className="bg-blue-600 text-white p-2 rounded">Export TXT</button>
              <button className="bg-blue-600 text-white p-2 rounded">Export JSON</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
