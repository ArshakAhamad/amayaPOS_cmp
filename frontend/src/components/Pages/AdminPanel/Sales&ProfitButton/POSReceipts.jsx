import React, { useState } from 'react';
import { Printer } from 'lucide-react';

const POSReceipts = () => {
  const [receipts, setReceipts] = useState([
    {
      customer: 'Walk-In-Customer',
      phone: '+94757110053',
      date: '2024-05-06 15:51:35',
      receiptNumber: 2865,
      cash: 3500,
      card: 0,
      createdBy: 'Arshak',
      status: 'Inactive',
    },
    {
      customer: 'Walk-In-Customer',
      phone: '+94715254076',
      date: '2024-05-06 14:58:49',
      receiptNumber: 2864,
      cash: 0,
      card: 1500,
      createdBy: 'Dulanga Bro',
      status: 'Active',
    },
    // More sample data as required...
  ]);

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        
        {/* Title & Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">POS Receipts</h2>
          <input
            type="text"
            placeholder="Search..."
            className="p-3 border border-gray-300 rounded-lg w-64"
          />
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Receipt</th>
                <th className="px-4 py-3 text-left">Cash</th>
                <th className="px-4 py-3 text-left">Card</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{receipt.customer}</td>
                  <td className="px-4 py-3">{receipt.phone}</td>
                  <td className="px-4 py-3">{receipt.date}</td>
                  <td className="px-4 py-3">{receipt.receiptNumber}</td>
                  <td className="px-4 py-3 font-bold">{receipt.cash.toLocaleString()}</td>
                  <td className="px-4 py-3">{receipt.card}</td>
                  <td className="px-4 py-3">{receipt.createdBy}</td>
                  <td className={`px-4 py-3 font-semibold ${receipt.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    {receipt.status}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-red-600 hover:text-red-800 font-semibold mr-2">Cancel</button>
                    <button>
                    <Printer />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Buttons */}
        <div className="export-buttons flex flex-wrap gap-4 mt-6">
          {["CSV", "SQL", "TXT", "JSON"].map((type) => (
            <button key={type} className="bg-gray-800 text-white px-4 py-2 rounded">
              Export {type}
            </button>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination-container flex justify-center mt-6">
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">1</button>
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">2</button>
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">3</button>
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">4</button>
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">5</button>
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">...</button>
          <button className="pagination-button bg-gray-800 text-white px-4 py-2 rounded mx-1">168</button>
        </div>
      </div>
    </div>
  );
};

export default POSReceipts;
