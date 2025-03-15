import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoucherList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [vouchers, setVouchers] = useState([]); // State to store voucher list
  const [error, setError] = useState(''); // State to store error message
  const [successMessage, setSuccessMessage] = useState(''); // State to store success message
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
        const response = await axios.get('http://localhost:5000/api/vouchers');
        console.log("Vouchers Data:", response.data); // Debugging: Log the data
        if (response.data.success) {
          setVouchers(response.data.vouchers);
        } else {
          setError(response.data.message || 'No vouchers found');
        }
      } catch (err) {
        setError('Failed to fetch vouchers');
        console.error('Error fetching vouchers:', err);
      }
    };

    fetchVouchers();
  }, []);

  // Handle Cancel button click
  const handleCancel = async (voucherId) => {
    try {
      const token = localStorage.getItem("jwt_token"); // Retrieve the JWT token
      if (!token) {
        setError("You need to be logged in to perform this action.");
        return;
      }

      // Send a request to the backend to cancel the voucher
      const response = await axios.put(
        `http://localhost:5000/api/vouchers/${voucherId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the header
          },
        }
      );

      if (response.data.success) {
        // Update the frontend state to reflect the changes
        setVouchers((prevVouchers) =>
          prevVouchers.map((voucher) =>
            voucher.id === voucherId
              ? { ...voucher, status: "Cancelled", active: "Inactive" } // Update status and active fields
              : voucher
          )
        );
        setSuccessMessage("Voucher cancelled successfully.");
        setError(""); // Clear any previous errors
      } else {
        setError(response.data.message || "Failed to cancel voucher.");
      }
    } catch (err) {
      setError("An error occurred while cancelling the voucher.");
      console.error("Error cancelling voucher:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className={`main-content flex-1 ml-${isSidebarOpen ? '64' : '20'} transition-all duration-300`}>
        <div className="p-6">
          {/* Title & Add Voucher Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Voucher</h2>
          </div>

          {/* Success or Error Message */}
          {successMessage && <div className="text-green-600">{successMessage}</div>}
          {error && <div className="text-red-600">{error}</div>}

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
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Loop through vouchers */}
                {vouchers.length > 0 ? (
                  vouchers.map((voucher, index) => {
                    const status = voucher.status || "Issued"; // Default to "Issued" if status is missing
                    const active = voucher.active || "Active"; // Default to "Active" if active is missing
                    const redeemedDate = voucher.redeemed_date || "Not Redeemed"; // Default to "Not Redeemed" if redeemed_date is missing

                    return (
                      <tr key={voucher.id}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{voucher.code}</td>
                        <td className="px-4 py-2">{voucher.value}</td>
                        <td className="px-4 py-2">{voucher.valid_days}</td>
                        <td className="px-4 py-2">{voucher.created_at}</td>
                        <td className="px-4 py-2">{calculateExpireDate(voucher.created_at, voucher.valid_days)}</td>
                        <td className="px-4 py-2">{redeemedDate}</td>
                        <td className="px-4 py-2">
                          <span className={`font-semibold ${status === 'Redeemed' ? 'text-green-600' : 'text-red-600'}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`font-semibold ${active === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                            {active}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                            onClick={() => handleCancel(voucher.id)} // Call handleCancel with voucher.id
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })
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