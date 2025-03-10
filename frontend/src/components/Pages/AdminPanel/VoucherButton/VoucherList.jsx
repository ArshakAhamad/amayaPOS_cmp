import React, { useState } from 'react';

const VoucherList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Sample Data with statuses
  const vouchers = [
    {
      id: 1,
      voucherCode: 'GV031',
      amount: 1000,
      expirePeriod: 185,
      issuedDate: '2024-05-06 15:51:35',
      expireDate: '2024-10-17',
      redeemedDate: '2024-04-21 16:44:14',
      status: 'Issued', // Red
      active: 'Active', // Green when active
    },
    {
      id: 2,
      voucherCode: 'GV018',
      amount: 2000,
      expirePeriod: 180,
      issuedDate: '2024-04-10 10:25:10',
      expireDate: '2024-10-12',
      redeemedDate: '2024-04-21 16:44:14',
      status: 'Redeemed', // Green
      active: 'Inactive', // Red when inactive
    },
    {
      id: 3,
      voucherCode: 'GV019',
      amount: 1500,
      expirePeriod: 90,
      issuedDate: '2024-03-01 09:15:00',
      expireDate: '2024-06-01',
      redeemedDate: '2024-05-15 14:30:00',
      status: 'Redeemed', // Green
      active: 'Active', // Green when active
    },
  ];

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
              <span>Entries per page : </span>
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
                {vouchers.map((voucher, index) => (
                  <tr key={voucher.id}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{voucher.voucherCode}</td>
                    <td className="px-4 py-2">{voucher.amount}</td>
                    <td className="px-4 py-2">{voucher.expirePeriod}</td>
                    <td className="px-4 py-2">{voucher.issuedDate}</td>
                    <td className="px-4 py-2">{voucher.expireDate}</td>
                    <td className="px-4 py-2">{voucher.redeemedDate}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`font-semibold ${
                          voucher.status === 'Redeemed' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`font-semibold ${
                          voucher.active === 'Active' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {voucher.active}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
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