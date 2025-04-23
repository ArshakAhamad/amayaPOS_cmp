// src/components/SupplierBills.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const SupplierBills = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supplierInfo, setSupplierInfo] = useState({
    name: location.state?.supplierName || "",
    outstanding: location.state?.outstandingAmount || 0,
  });

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/suppliers/${id}/settlements`
      );
      setSettlements(response.data.settlements);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load bill settlements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [id]);

  const handleBack = () => {
    navigate("/AdminPanel/SupplierList");
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Bill Settlements for {supplierInfo.name}
            </h2>
            <p className="text-gray-600 mt-1">
              Outstanding Amount:{" "}
              <span className="font-semibold">
                LKR{" "}
                {supplierInfo.outstanding.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Suppliers
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Bill No</th>
                <th className="px-4 py-3 text-right">Amount (LKR)</th>
                <th className="px-4 py-3 text-left">Settlement Date</th>
                <th className="px-4 py-3 text-left">Settled By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No bill settlements found
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{settlement.bill_no}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {settlement.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(
                        settlement.settlement_date
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {settlement.settled_by || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierBills;
