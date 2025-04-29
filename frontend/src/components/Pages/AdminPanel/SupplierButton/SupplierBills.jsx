import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SupplierBills = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    supplier: null,
    settlements: [],
    summary: {
      outstanding: 0,
      settled: 0,
      total: 0,
    },
    loading: true,
    error: null,
  });

  const fetchSettlements = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `http://localhost:5000/api/suppliers/${id}/settlements`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        setData({
          supplier: result.supplier,
          settlements: result.settlements || [],
          summary: result.summary || { outstanding: 0, settled: 0, total: 0 },
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.message || "Failed to load settlements");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [id]);

  const handleBack = () => navigate("/AdminPanel/SupplierList");

  const [settlingBill, setSettlingBill] = useState(null);

  const handleSettleBill = async (billId) => {
    setSettlingBill(billId);
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem("token");

      // 2. Validate token exists
      if (!token) {
        toast.error("Please login to perform this action");
        navigate("/login");
        return;
      }

      // 3. Debugging - log the token being sent
      console.log("Token being sent:", token);

      // 4. Set default headers for axios (optional - can use instance instead)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 5. Make the PUT request
      const response = await axios.put(
        `http://localhost:5000/api/suppliers/${id}/settlements/${billId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 6. Handle successful response
      if (response.data.success) {
        toast.success("Bill settled successfully!");

        // 7. Refresh the settlements data
        await fetchSettlements();

        // 8. Optional: Log success
        console.log("Settlement successful for bill:", billId);
      } else {
        // Handle API success=false case
        toast.error(response.data.message || "Failed to settle bill");
      }
    } catch (error) {
      console.error("Settlement error:", error);

      // 9. Enhanced error handling
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          // Token expired or invalid
          toast.error("Session expired - please login again");
          localStorage.removeItem("token");
          localStorage.removeItem("user"); // If you store user data
          navigate("/login");
        } else if (error.response.status === 404) {
          toast.error("Bill not found");
        } else if (error.response.status === 400) {
          toast.error(error.response.data.message || "Invalid request");
        } else {
          toast.error(error.response.data.message || "Failed to settle bill");
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server - please check your connection");
      } else {
        // Something happened in setting up the request
        toast.error("Error setting up request");
        console.error("Request setup error:", error.message);
      }
    } finally {
      // 10. Reset loading state
      setSettlingBill(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not settled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Bill Settlements for {data.supplier?.name || "Supplier"}
            </h2>
            <div className="flex gap-4 mt-2">
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-sm text-blue-800">Outstanding</p>
                <p className="font-bold">
                  {formatCurrency(data.summary.outstanding)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-green-800">Settled</p>
                <p className="font-bold">
                  {formatCurrency(data.summary.settled)}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-800">Total</p>
                <p className="font-bold">
                  {formatCurrency(data.summary.total)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Suppliers
          </button>
        </div>

        {data.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {data.error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Bill No</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Purchase Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Settled On</th>
                <th className="px-4 py-3 text-left">Settled By</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : data.settlements.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-2 text-gray-600">
                        No settlement records found
                      </p>
                      <p className="text-sm text-gray-500">
                        This supplier has no outstanding or settled bills
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.settlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{settlement.bill_no}</td>
                    <td className="px-4 py-3">{settlement.product_name}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(settlement.unitCost)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {settlement.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(settlement.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(settlement.purchase_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          settlement.settlement_date === null
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {settlement.settlement_date === null
                          ? "Unsettled"
                          : "Settled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {settlement.settlement_date
                        ? formatDate(settlement.settlement_date)
                        : "--"}
                    </td>
                    <td className="px-4 py-3">
                      {settlement.settled_by || "--"}
                    </td>
                    <td className="px-4 py-3">
                      {settlement.settlement_date === null && (
                        <button
                          onClick={() => handleSettleBill(settlement.id)}
                          disabled={settlingBill === settlement.id}
                          className={`px-3 py-1 text-white rounded text-sm ${
                            settlingBill === settlement.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {settlingBill === settlement.id
                            ? "Processing..."
                            : "Settle"}
                        </button>
                      )}
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
