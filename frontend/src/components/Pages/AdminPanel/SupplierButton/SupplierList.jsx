import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate correctly
import "reactjs-popup/dist/index.css";

const SupplierList = () => {
  const navigate = useNavigate();  // Initialize navigate function

  const [suppliers, setSuppliers] = useState([
    { name: "Supplier 1", outstanding: 150.0, createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { name: "Supplier 2", outstanding: 200.0, createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { name: "Supplier 3", outstanding: 100.0, createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
  ]);

  const handleSupplierBills = () => {
    navigate("/AdminPanel/SupplierBills"); // Correctly use the navigate function
  };

  const handleStatusChange = (index) => {
    const updatedSuppliers = [...suppliers];
    updatedSuppliers[index].status = updatedSuppliers[index].status === "Active" ? "Inactive" : "Active";
    setSuppliers(updatedSuppliers);
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        
        {/* 🔷 Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Supplier</h2>
          <div className="barcode-select-container">
            <span>Entries per page:</span>
            <select className="p-3 border border-gray-300 rounded-lg w-20">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <input
              type="text"
              className="p-3 border border-gray-300 rounded-lg w-64"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* 🔷 Supplier Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[5%]">No</th>
                <th className="px-4 py-3 text-left w-[20%]">Supplier</th>
                <th className="px-4 py-3 text-right w-[15%]">Outstanding</th>
                <th className="px-4 py-3 text-left w-[20%]">Created Date</th>
                <th className="px-4 py-3 text-left w-[15%]">Created By</th>
                <th className="px-4 py-3 text-center w-[10%]">Status</th>
                <th className="px-4 py-3 text-center w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{supplier.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{supplier.outstanding.toFixed(2)} LKR</td>
                  <td className="px-4 py-3">{supplier.createdDate}</td>
                  <td className="px-4 py-3">{supplier.createdBy}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${supplier.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleStatusChange(index)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={handleSupplierBills} // Handle the bill settlement redirect
                      className="text-green-600 hover:text-green-800 font-semibold"
                    >
                      BillSettle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔷 Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600">Showing 1 to {suppliers.length} of {suppliers.length} entries</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
