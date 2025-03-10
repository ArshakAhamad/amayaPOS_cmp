import React, { useState } from "react";

const PurchaseBills = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const purchaseBills = [
    { id: 1, date: "2024-05-05", billType: "POS_GRN", billNo: "1001", supplier: "Supplier 1", amount: "4,500.00" },
    { id: 2, date: "2024-05-04", billType: "POS_GRN", billNo: "1002", supplier: "Supplier 2", amount: "3,200.00"},
    { id: 3, date: "2024-05-03", billType: "POS_GRN", billNo: "1003", supplier: "Supplier 3", amount: "5,000.00"},
  ];

  const filteredBills = purchaseBills.filter((bill) =>
    bill.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.billNo.includes(searchQuery)
  );

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        
        {/* 🔷 Title & Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Purchase Bills</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-64"
            placeholder="Search Purchase Bills..."
          />
        </div>

        {/* 🔷 Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Bill Type</th>
                <th className="px-4 py-3 text-left">Bill No</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill, index) => (
                  <tr key={bill.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{bill.date}</td>
                    <td className="px-4 py-3">{bill.billType}</td>
                    <td className="px-4 py-3">{bill.billNo}</td>
                    <td className="px-4 py-3">{bill.supplier}</td>
                    <td className="px-4 py-3 font-bold text-red-500">{bill.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 italic text-gray-500">
                    No Purchase Bills Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔷 Export Buttons */}
        <div className="export-buttons flex flex-wrap gap-4 mt-6">
          {["CSV", "SQL", "TXT", "JSON"].map((type) => (
            <button key={type}>{`Export ${type}`}</button>
          ))}
        </div>

        
        <div className="pagination-container">
  <button className="pagination-button">1</button>
  <button className="pagination-button">2</button>
  <button className="pagination-button">3</button>
  <button className="pagination-button">4</button>
  <button className="pagination-button">5</button>
  <button className="pagination-button">...</button>
  <button className="pagination-button">Next</button>
</div>

      </div>
    </div>
  );
};

export default PurchaseBills;
