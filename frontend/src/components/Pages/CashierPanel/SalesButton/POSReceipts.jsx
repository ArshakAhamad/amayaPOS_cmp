import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';

const POSReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch payment data from the API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        setReceipts(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, []);

  // Filter receipts based on search term
  const filteredReceipts = receipts.filter(receipt => {
    const searchLower = searchTerm.toLowerCase();
    return (
      receipt.customer?.toLowerCase().includes(searchLower) ||
      receipt.phone?.toLowerCase().includes(searchLower) ||
      receipt.receipt_number?.toLowerCase().includes(searchLower) ||
      receipt.created_by?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = (type) => {
    if (filteredReceipts.length === 0) {
      alert('No data to export');
      return;
    }

    let content = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `receipts-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case 'CSV':
        content = convertToCSV(filteredReceipts);
        break;
      case 'SQL':
        content = convertToSQL(filteredReceipts);
        break;
      case 'TXT':
        content = convertToTXT(filteredReceipts);
        break;
      case 'JSON':
        content = JSON.stringify(filteredReceipts, null, 2);
        break;
      default:
        return;
    }

    downloadFile(content, filename, type === 'JSON' ? 'application/json' : 'text/plain');
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(value => {
        if (value === null || value === undefined) return '';
        const val = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const convertToSQL = (data) => {
    if (data.length === 0) return '';
    const tableName = 'receipts';
    const columns = Object.keys(data[0]).join(', ');
    const values = data.map(obj => 
      `(${Object.values(obj).map(value => {
        if (value === null || value === undefined) return 'NULL';
        const val = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
      }).join(', ')})`
    ).join(',\n');
    
    return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
  };

  const convertToTXT = (data) => {
    return data.map(obj => 
      Object.entries(obj).map(([key, value]) => {
        const val = value === null || value === undefined ? 'N/A' : 
                   typeof value === 'object' ? JSON.stringify(value) : value.toString();
        return `${key}: ${val}`;
      }).join('\n')
    ).join('\n\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintReceipt = (receiptId) => {
    const receiptToPrint = receipts.find(r => r.id === receiptId);
    if (!receiptToPrint) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receiptToPrint.receipt_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-top: 1px dashed #000; margin: 15px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .footer { margin-top: 20px; text-align: center; font-size: 0.8em; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>CeylonX Corporation</h2>
              <p>123 Store Address</p>
              <p>Phone: (123) 456-7890</p>
            </div>
            <div class="divider"></div>
            <div class="row">
              <span>Receipt #:</span>
              <span>${receiptToPrint.receipt_number}</span>
            </div>
            <div class="row">
              <span>Date:</span>
              <span>${new Date(receiptToPrint.created_at).toLocaleString()}</span>
            </div>
            <div class="row">
              <span>Customer:</span>
              <span>${receiptToPrint.customer || 'Walk-in'}</span>
            </div>
            <div class="divider"></div>
            <div class="row">
              <span>Cash:</span>
              <span>${receiptToPrint.cash?.toLocaleString() || '0'}</span>
            </div>
            <div class="row">
              <span>Card:</span>
              <span>${receiptToPrint.card?.toLocaleString() || '0'}</span>
            </div>
            <div class="divider"></div>
            <div class="row" style="font-weight: bold;">
              <span>Total:</span>
              <span>${(receiptToPrint.cash + receiptToPrint.card)?.toLocaleString()}</span>
            </div>
            <div class="footer">
              <p>Thank you for your purchase!</p>
              <p>${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Title & Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">POS Receipts</h2>
          <input
            type="text"
            placeholder="Search..."
            className="p-3 border border-gray-300 rounded-lg w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Receipt</th>
                <th className="px-4 py-3 text-left">Cash</th>
                <th className="px-4 py-3 text-left">Card</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt, index) => (
                <tr key={receipt.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{receipt.customer || 'Walk-in'}</td>
                  <td className="px-4 py-3">{receipt.phone || 'N/A'}</td>
                  <td className="px-4 py-3">{new Date(receipt.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{receipt.receipt_number}</td>
                  <td className="px-4 py-3 font-bold">{receipt.cash?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-3">{receipt.card?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-3">{receipt.created_by}</td>
                  <td className={`px-4 py-3 font-semibold ${receipt.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    {receipt.status}
                  </td>
                  <td className="px-4 py-3 flex items-center">
                    <button 
                      className="text-red-600 hover:text-red-800 font-semibold mr-3"
                      onClick={() => console.log('Cancel receipt:', receipt.id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handlePrintReceipt(receipt.id)}
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Buttons */}
        <div className="export-buttons flex flex-wrap gap-4 mt-6">
          {["CSV", "SQL", "TXT", "JSON"].map((type) => (
            <button 
              key={type} 
              onClick={() => handleExport(type)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Export {type}
            </button>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination-container flex justify-center mt-6">
          {[1, 2, 3, 4, 5, '...', Math.ceil(filteredReceipts.length / 10)].map((num, idx) => (
            <button 
              key={idx} 
              className={`pagination-button ${num === 1 ? 'bg-blue-600' : 'bg-gray-800'} text-white px-4 py-2 rounded mx-1 hover:bg-opacity-90`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default POSReceipts;