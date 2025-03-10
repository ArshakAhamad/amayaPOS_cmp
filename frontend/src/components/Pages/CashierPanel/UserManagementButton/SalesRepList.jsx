import React, { useState } from "react";
import { Pencil } from 'lucide-react';

const CashierSalesRepList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const salesReps = [
    { id: 1, name: "Sales Rep 1", email: "salesrep1@gmail.com", phone: "+94712345678", store: "Sales Person Store", date: "2024-05-06 15:13:35", createdBy: "Admin", status: "Active" },
    { id: 2, name: "Sales Rep 2", email: "salesrep2@gmail.com", phone: "+94712345678", store: "Sales Person Store", date: "2024-05-06 15:13:35", createdBy: "Admin", status: "Active" },
    { id: 3, name: "Sales Rep 3", email: "salesrep3@gmail.com", phone: "+94712345678", store: "Sales Person Store", date: "2024-05-06 15:13:35", createdBy: "Admin", status: "Inactive" },
    { id: 4, name: "Sales Rep 4", email: "salesrep4@gmail.com", phone: "+94712345678", store: "Sales Person Store", date: "2024-05-06 15:13:35", createdBy: "Admin", status: "Active" },
  ];

  const filteredSalesReps = salesReps.filter(rep =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.phone.includes(searchTerm)
  );

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        
        {/* 🔷 Title & Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Sales Rep List</h2>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="p-3 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🔷 Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Sales Rep</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Store</th>
                <th className="px-4 py-3 text-left">Created Date</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesReps.map((rep, index) => (
                <tr key={rep.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{rep.name}</td>
                  <td className="px-4 py-3">{rep.email}</td>
                  <td className="px-4 py-3">{rep.phone}</td>
                  <td className="px-4 py-3">{rep.store}</td>
                  <td className="px-4 py-3">{rep.date}</td>
                  <td className="px-4 py-3">{rep.createdBy}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        rep.status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {rep.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 transition">
                      <Pencil width={20} height={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔷 Export Buttons */}
        <div className="export-buttons flex flex-wrap gap-4 mt-6">
          {["CSV", "SQL", "TXT", "JSON"].map((type) => (
            <button
              key={type}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {`Export ${type}`}
            </button>
          ))}
        </div>

        {/* 🔷 Pagination */}
        <div className="pagination-container flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5, "...", 168].map((page, index) => (
            <button
              key={index}
              className={`pagination-button px-4 py-2 rounded-lg ${
                page === 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashierSalesRepList;