import React from 'react';
import { Link } from 'react-router-dom';

const CashierAddVouchers = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
   
      {/* Main Content */}
      <div className="main-content flex-1 ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Title and Buttons */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Create Voucher</h2>
            <button className="bg-blue-600 text-white p-2 rounded">Add Voucher</button>
          </div>

          {/* Voucher Setup Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Voucher Setup</h3>
            <p className="mb-6">You can create New Vouchers from here</p>

            {/* Voucher Details Section */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2">Voucher Details</h4>
              <div className="barcode-select-container">
                <input
                  type="text"
                  placeholder="Voucher Code"
                  className="p-2 border rounded-md w-1/3"
                />
                <input
                  type="number"
                  placeholder="Value (LKR)"
                  className="p-2 border rounded-md w-1/3"
                />
                <input
                  type="number"
                  placeholder="Valid Days"
                  className="p-2 border rounded-md w-1/3"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="bg-blue-600 text-white p-2 rounded-md">Save</button>
              <button className="bg-gray-500 text-white p-2 rounded-md">New</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierAddVouchers;
