import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SupplierList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/suppliers",
          {
            params: { search: searchQuery },
          }
        );
        console.log("API Response:", response.data);
        console.log("Suppliers Data:", response.data.suppliers);
        setSuppliers(response.data.suppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [searchQuery]);

  const handleStatusChange = async (id, index) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/suppliers/${id}/toggle-status`
      );
      if (response.data.success) {
        const updatedSuppliers = [...suppliers];
        updatedSuppliers[index].status =
          updatedSuppliers[index].status === "Active" ? "Inactive" : "Active";
        setSuppliers(updatedSuppliers);
      }
    } catch (error) {
      console.error("Error toggling supplier status:", error);
    }
  };

  const handleSupplierBills = (id) => {
    navigate(`/AdminPanel/SupplierBills`);
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{supplier.supplier_name}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {typeof supplier.outstanding === "number"
                        ? supplier.outstanding.toFixed(2)
                        : "N/A"}{" "}
                      LKR
                    </td>
                    <td className="px-4 py-3">{supplier.created_at}</td>
                    <td className="px-4 py-3">{supplier.created_by}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          supplier.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-3">
                      <button
                        onClick={() => handleStatusChange(supplier.id, index)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={handleSupplierBills}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        BillSettle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600">
            Showing 1 to {suppliers.length} of {suppliers.length} entries
          </p>
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
