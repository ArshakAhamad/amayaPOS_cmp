import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoucherList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [vouchers, setVouchers] = useState([]);  // State to store voucher list
  const [error, setError] = useState('');  // State to store error message
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

 // Helper function to calculate Expire Date
 const calculateExpireDate = (issuedDate, expirePeriod) => {
  const issuedDateObj = new Date(issuedDate);
  issuedDateObj.setDate(issuedDateObj.getDate() + expirePeriod); // Add expire period (in days)
  return issuedDateObj.toISOString().split('T')[0]; // Return the formatted date (YYYY-MM-DD)
};

  // Fetch vouchers from backend on component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vouchers'); // Your API endpoint
        if (response.data.success) {
          setVouchers(response.data.vouchers);  // Set vouchers state
        } else {
          setError(response.data.message || 'No vouchers found');
        }
      } catch (err) {
        setError('Failed to fetch vouchers');
        console.error('Error fetching vouchers:', err);
      }
    };

    fetchVouchers();  // Call function to fetch vouchers
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className={`main-content flex-1 ml-${isSidebarOpen ? '64' : '20'} transition-all duration-300`}>
        <div className="p-6">
          {/* Title & Add Voucher Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Voucher</h2>
          </div>

          {/* Voucher Details */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl">Voucher Details</h3>
            <div className="flex gap-4">
              <span>Entries per page: </span>
              <select className="p-2 border rounded-lg">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          {/* Voucher Table */}
          <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">No</th>
                  <th className="px-4 py-2 text-left">Voucher</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Expire Period</th>
                  <th className="px-4 py-2 text-left">Issued Date</th>
                  <th className="px-4 py-2 text-left">Expire Date</th>
                  <th className="px-4 py-2 text-left">Redeemed Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Active</th>
                  <th className="px-4 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {/* Loop through vouchers */}
                {vouchers.length > 0 ? (
                  vouchers.map((voucher, index) => (
                    <tr key={voucher.id}>
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{voucher.code}</td>
                      <td className="px-4 py-2">{voucher.value}</td>
                      <td className="px-4 py-2">{voucher.valid_days}</td>
                      <td className="px-4 py-2">{voucher.created_at}</td>
                      <td className="px-4 py-2">{calculateExpireDate(voucher.created_at, voucher.valid_days)}</td>
                      <td className="px-4 py-2">{voucher.redeemedDate}</td>
                      <td className="px-4 py-2">
                        <span className={`font-semibold ${voucher.status === 'Redeemed' ? 'text-green-600' : 'text-red-600'}`}>
                          {voucher.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`font-semibold ${voucher.active === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                          {voucher.active}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button type="button" className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-2 text-center">No vouchers available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Export Buttons */}
          <div className="mt-4 flex gap-4">
            <button className="bg-blue-600 text-white p-2 rounded-lg">Export CSV</button>
            <button className="bg-blue-600 text-white p-2 rounded-lg">Export SQL</button>
            <button className="bg-blue-600 text-white p-2 rounded-lg">Export TXT</button>
            <button className="bg-blue-600 text-white p-2 rounded-lg">Export JSON</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherList;
