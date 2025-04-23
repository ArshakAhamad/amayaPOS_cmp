import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SupplierBills = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    unsettledBills: [],
    settledBills: [],
    supplier: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/suppliers/${id}/bills`
        );
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [id]);

  const handleSettleBill = async (billId) => {
    const password = prompt("Enter admin password to settle this bill:");
    if (!password) return;

    try {
      await axios.post(`http://localhost:5000/api/suppliers/${id}/settle`, {
        billId,
        approvalPassword: password,
      });
      // Refresh data after settlement
      const res = await axios.get(
        `http://localhost:5000/api/suppliers/${id}/bills`
      );
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to settle bill");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.supplier) return <div>Supplier not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{data.supplier.supplier_name}</h1>
      <p className="mb-6">
        Outstanding: LKR {data.supplier.outstanding?.toFixed(2) || "0.00"}
      </p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Unsettled Bills</h2>
        {data.unsettledBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Product</th>
                  <th className="py-2 px-4 border">Quantity</th>
                  <th className="py-2 px-4 border">Unit Cost</th>
                  <th className="py-2 px-4 border">Total</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.unsettledBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border">{bill.product}</td>
                    <td className="py-2 px-4 border text-right">
                      {bill.quantity}
                    </td>
                    <td className="py-2 px-4 border text-right">
                      LKR {bill.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border text-right font-semibold">
                      LKR {bill.totalCost.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => handleSettleBill(bill.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No unsettled bills</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Settlement History</h2>
        {data.settledBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Bill No</th>
                  <th className="py-2 px-4 border">Product</th>
                  <th className="py-2 px-4 border">Amount</th>
                  <th className="py-2 px-4 border">Settled By</th>
                </tr>
              </thead>
              <tbody>
                {data.settledBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">
                      {new Date(bill.settlement_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border">{bill.bill_no}</td>
                    <td className="py-2 px-4 border">{bill.product}</td>
                    <td className="py-2 px-4 border text-right">
                      LKR {bill.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border">{bill.settled_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No settlement history</p>
        )}
      </div>
    </div>
  );
};

export default SupplierBills;
