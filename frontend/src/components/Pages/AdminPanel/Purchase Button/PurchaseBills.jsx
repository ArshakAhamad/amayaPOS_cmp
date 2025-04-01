import React, { useState, useEffect } from "react";
import axios from "axios";

const PurchaseBills = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchaseBills = async () => {
      try {
        const response = await axios.get("/api/purchase-bills", { 
          withCredentials: true,
          baseURL: process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : window.location.origin
        });
        
        // Format the data to ensure all required fields exist
        const formattedData = response.data.map(bill => ({
          ...bill,
          billType: bill.billType || 'POS_GRN',
          billNo: bill.billNo || bill.id,
          amount: typeof bill.amount === 'string' 
            ? parseFloat(bill.amount.replace(/,/g, '')) 
            : Number(bill.amount)
        }));
        
        setPurchaseBills(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching purchase bills:", err);
        setError(err.response?.data?.error || "Failed to fetch purchase bills");
        setLoading(false);
      }
    };

    fetchPurchaseBills();
  }, []);

  const filteredBills = purchaseBills.filter(
    (bill) =>
      (bill.supplier?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (bill.billNo?.toString() || '').includes(searchQuery)
  );

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Title & Search Bar */}
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

        {/* Table Section */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : filteredBills.length > 0 ? (
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
                {filteredBills.map((bill, index) => (
                  <tr key={bill.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{bill.date}</td>
                    <td className="px-4 py-3">{bill.billType}</td>
                    <td className="px-4 py-3">{bill.billNo}</td>
                    <td className="px-4 py-3">{bill.supplier}</td>
                    <td className="px-4 py-3 font-bold text-red-500">
                      {bill.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="italic text-gray-500">
                {purchaseBills.length === 0 
                  ? "No purchase bills found in the system" 
                  : "No bills match your search criteria"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseBills;