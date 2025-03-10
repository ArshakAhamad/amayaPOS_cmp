import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil } from 'lucide-react';

const SalesRepList = () => {
  const [salesReps, setSalesReps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch sales reps from the backend when the component mounts
    const fetchSalesReps = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sales-reps");
        if (response.data.success) {
          setSalesReps(response.data.salesReps);
        } else {
          console.error("Failed to fetch sales reps");
        }
      } catch (error) {
        console.error("Error fetching sales reps:", error);
      }
    };

    fetchSalesReps();
  }, []); // Empty array means this runs only once after the first render

  const filteredSalesReps = salesReps.filter(rep =>
    rep.salesrep_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.phone.includes(searchTerm)
  );

  // Toggle status function
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const response = await axios.patch(`http://localhost:5000/api/sales-rep/status/${id}`, {
        status: newStatus,
      });

      if (response.data.success) {
        // Update the salesRep list with the new status
        setSalesReps((prevReps) =>
          prevReps.map((rep) =>
            rep.salesrep_id === id ? { ...rep, status: newStatus } : rep
          )
        );
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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
                <tr key={rep.salesrep_id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{rep.salesrep_name}</td>
                  <td className="px-4 py-3">{rep.email}</td>
                  <td className="px-4 py-3">{rep.phone}</td>
                  <td className="px-4 py-3">{rep.store}</td>
                  <td className="px-4 py-3">{rep.created_at}</td>
                  <td className="px-4 py-3">{rep.createdBy ? rep.createdBy : "Admin"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        rep.status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {rep.status === "Active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition"
                      onClick={() => toggleStatus(rep.salesrep_id, rep.status)}
                    >
                      <Pencil width={20} height={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesRepList;
