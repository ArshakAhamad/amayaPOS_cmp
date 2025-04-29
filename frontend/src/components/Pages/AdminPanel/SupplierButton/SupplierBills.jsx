import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Popup from "reactjs-popup";
import { Icon } from "@iconify/react";
import eyeOff from "@iconify/icons-mdi/eye-off";
import eye from "@iconify/icons-mdi/eye";

const SupplierBills = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State declarations
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

  const [selectedBillId, setSelectedBillId] = useState(null);
  const [approvalPassword, setApprovalPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [passwordIcon, setPasswordIcon] = useState(eyeOff);
  const [settlingBill, setSettlingBill] = useState(null);

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
    setPasswordIcon(passwordIcon === eyeOff ? eye : eyeOff);
  };

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

  const handleSettleBill = (billId) => {
    setSelectedBillId(billId);
  };

  const confirmSettlement = async (close) => {
    if (!approvalPassword) {
      toast.error("Please enter approval password");
      return;
    }

    try {
      setSettlingBill(selectedBillId);
      const token = localStorage.getItem("token");

      // Verify password first
      const verifyResponse = await axios.post(
        "http://localhost:5000/api/verify-password",
        { password: approvalPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!verifyResponse.data.success) {
        throw new Error("Invalid approval password");
      }

      // If password is correct, proceed with settlement
      const response = await axios.put(
        `http://localhost:5000/api/suppliers/${id}/settlements/${selectedBillId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Bill settled successfully!");
        await fetchSettlements();
        setApprovalPassword("");
        if (close) close();
      }
    } catch (error) {
      console.error("Settlement error:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to settle bill");
      } else {
        toast.error(error.message || "Settlement failed");
      }
    } finally {
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

  if (data.loading) {
    return (
      <div className="main-content p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="main-content p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
          <div className="text-red-500 text-center py-10">
            {data.error}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {data.settlements.length === 0 ? (
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
                        <Popup
                          trigger={
                            <button
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
                          }
                          modal
                          onOpen={() => handleSettleBill(settlement.id)}
                          onClose={() => {
                            setPasswordType("password");
                            setPasswordIcon(eyeOff);
                            setApprovalPassword("");
                          }}
                        >
                          {(close) => (
                            <div className="w-full p-4 bg-gray-900 text-white rounded-lg">
                              <h3 className="text-xl font-bold mb-4">
                                Confirm Bill Settlement
                              </h3>
                              <p className="mb-4">
                                You are about to settle bill #{settlement.id}
                              </p>
                              <p className="mb-4 font-bold">
                                Amount: {formatCurrency(settlement.amount)}
                              </p>

                              <div className="form-field mb-4">
                                <label className="block mb-2">
                                  Manager Password:
                                </label>
                                <div className="relative">
                                  <input
                                    type={passwordType}
                                    value={approvalPassword}
                                    onChange={(e) =>
                                      setApprovalPassword(e.target.value)
                                    }
                                    className="w-full p-2 pl-3 pr-10 border rounded bg-gray-800 text-white placeholder-gray-400"
                                    placeholder="Enter password"
                                  />
                                  <span
                                    className="absolute right-3 top-2.5 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                  >
                                    <Icon icon={passwordIcon} size={20} />
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    close();
                                    setApprovalPassword("");
                                  }}
                                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => confirmSettlement(close)}
                                  className={`px-4 py-2 rounded text-white transition-colors ${
                                    approvalPassword
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : "bg-blue-400 cursor-not-allowed"
                                  }`}
                                  disabled={!approvalPassword}
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          )}
                        </Popup>
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
