import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import { useNavigate } from 'react-router-dom';

const SupplierHY = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalPassword, setApprovalPassword] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();

  // Fetch supplier bills from API
  useEffect(() => {
    const fetchSupplierBills = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/suppliers/bills');
        const result = await response.json();
        
        if (result.success) {
          // Transform data to match your table structure
          const formattedData = result.bills.map((bill, index) => ({
            no: index + 1,
            date: bill.settlement_date,
            billNo: bill.bill_no,
            outstanding: bill.outstanding_amount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }),
            name: bill.supplier_name,
            supplierId: bill.supplier_id,
            settledAmount: bill.settled_amount
          }));
          
          setData(formattedData);
        } else {
          console.error('Failed to fetch supplier bills:', result.message);
        }
      } catch (err) {
        console.error('Error fetching supplier bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierBills();
  }, []);

  const handleApproval = async (close) => {
    try {
      if (!selectedSupplier) {
        throw new Error('No supplier selected');
      }
      
      if (!approvalPassword) {
        throw new Error('Please enter approval password');
      }
  
      const amount = parseFloat(selectedSupplier.outstanding.replace(/,/g, ''));
  
      const response = await fetch('http://localhost:5000/api/suppliers/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          billNo: selectedSupplier.billNo,
          supplierId: selectedSupplier.supplierId,
          outstandingAmount: amount,
          approvalPassword: approvalPassword
        })
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to settle bill');
      }
  
      alert(`Success! Bill ${selectedSupplier.billNo} settled.`);
      setData(data.filter(item => item.billNo !== selectedSupplier.billNo));
      setApprovalPassword('');
      close();
      
    } catch (err) {
      console.error('Settlement error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="bg-black text-white p-8">Loading supplier bills...</div>;
  }

  return (
    <div className="bg-black text-white p-8">
      <h1 className="text-2xl mb-4">SUPPLIER H&Y</h1>
      <div className="mb-6">
        <div className="flex justify-between mt-2 mb-4">
          <div>
            <span className="text-sm text-gray-400">{data.length} entries</span>
          </div>
          <h3>Bill Details</h3>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 p-2 rounded text-white text-sm"
              onChange={(e) => {
                // Implement search functionality here
              }}
            />
          </div>
        </div>
      </div>

      <table className="table-auto w-full text-left">
        <thead>
          <tr className="bg-gray-800">
            <th className="px-4 py-2">No</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Bill No</th>
            <th className="px-4 py-2">Outstanding</th>
            <th className="px-4 py-2">Settle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.no} className="hover:bg-gray-800">
              <td className="px-4 py-2">{item.no}</td>
              <td className="px-4 py-2">{item.date}</td>
              <td className="px-4 py-2">{item.billNo}</td>
              <td className="px-4 py-2">LKR {item.outstanding}</td>
              <td className="px-4 py-2">
              <Popup
  trigger={
   // Change the settle button to this:
<button
  className="text-green-600 hover:text-green-800 font-semibold"
  onClick={() => {
    setSelectedSupplier(item); // Set supplier before opening popup
  }}
>
  Settle
</button>
  }
  modal
  onOpen={() => setSelectedSupplier(item)} // Set supplier when opening
  onClose={() => setSelectedSupplier(null)} // Clear when closing
>
  {(close) => (
    <div className="w-full p-4">
      {selectedSupplier ? (
        <>
          <h3 className="text-xl font-bold mb-4">Settle Bill: {selectedSupplier.billNo}</h3>
          <p className="mb-2">Supplier: {selectedSupplier.name}</p>
          <p className="mb-4">Amount: LKR {selectedSupplier.outstanding}</p>
          
          <div className="mb-4">
            <label className="block mb-2">Manager Password:</label>
            <input
              type="password"
              value={approvalPassword}
              onChange={(e) => setApprovalPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter password"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={close}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleApproval(close)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={!approvalPassword}
            >
              Approve
            </button>
          </div>
        </>
      ) : (
        <p>Loading bill details...</p>
      )}
    </div>
  )}
</Popup>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ... (keep your existing export buttons and pagination) */}
    </div>
  );
};

export default SupplierHY;