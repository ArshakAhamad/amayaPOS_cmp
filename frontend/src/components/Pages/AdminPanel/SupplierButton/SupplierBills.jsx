import React, { useState } from "react";
import Popup from "reactjs-popup";

const SupplierHY = () => {
  const [data, setData] = useState([
    { no: 1, date: "2024-03-16", billNo: 19, outstanding: "94,470.00", name: "Supplier 1" },
    { no: 2, date: "2024-03-16", billNo: 26, outstanding: "119,630.00", name: "Supplier 2" },
    { no: 3, date: "2024-03-16", billNo: 25, outstanding: "375,915.00", name: "Supplier 3" },
    { no: 4, date: "2024-03-16", billNo: 20, outstanding: "66,420.00", name: "Supplier 4" },
    { no: 5, date: "2024-03-16", billNo: 13, outstanding: "467,550.00", name: "Supplier 5" },
    { no: 6, date: "2024-03-16", billNo: 18, outstanding: "253,080.00", name: "Supplier 6" },
    { no: 7, date: "2024-03-17", billNo: 29, outstanding: "22,540.00", name: "Supplier 7" },
    { no: 8, date: "2024-03-17", billNo: 17, outstanding: "163,950.00", name: "Supplier 8" },
    { no: 9, date: "2024-03-21", billNo: 30, outstanding: "51,080.00", name: "Supplier 9" },
    { no: 10, date: "2024-03-21", billNo: 1, outstanding: "18,560.00", name: "Supplier 10" },
  ]);

  const [approvalPassword, setApprovalPassword] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleApproval = (close) => {
    if (approvalPassword === "admin123" || barcodeInput.length > 5) {
      alert(`Bill for ${selectedSupplier?.name} settled successfully!`);
      close(); // Close popup after successful approval
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="bg-black text-white p-8">
      <h1 className="text-2xl mb-4">SUPPLIER H&Y</h1>
      <div className="mb-6">
        <div className="flex justify-between mt-2 mb-4">
          <div>
            <span className="text-sm text-gray-400">10 entries per page</span>
          </div>
          <h3>Bill Details</h3>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 p-2 rounded text-white text-sm"
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
              <td className="px-4 py-2">{item.outstanding}</td>
              <td className="px-4 py-2">
                <Popup
                  trigger={
                    <button
                      className="text-green-600 hover:text-green-800 font-semibold"
                      onClick={() => setSelectedSupplier(item)}
                    >
                      Settle
                    </button>
                  }
                  modal
                  closeOnDocumentClick={false}
                  lockScroll
                  contentStyle={{
                    maxWidth: "450px",
                    width: "90%",
                    padding: "25px",
                    borderRadius: "12px",
                    background: "white",
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                  overlayStyle={{
                    background: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(close) => (
                    <div className="w-full">
                      {/* 🔹 Title */}
                      <h3 className="text-xl font-semibold mb-4">Manager Approval</h3>

                      {/* 🔹 Instruction */}
                      <p className="text-gray-600 mb-6">
                        Enter the manager password or scan the barcode to approve the bill settlement for{" "}
                        <strong>{selectedSupplier?.name}</strong>.
                      </p>

                      <div className="flex flex-col space-y-4">
                        <label htmlFor="password">Password: </label>
                        <input
                          type="password"
                          placeholder="Enter Password"
                          value={approvalPassword}
                          onChange={(e) => setApprovalPassword(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />

                     {/* <label htmlFor="barcode">ID/Barcode: </label>
                        <input
                          type="text"
                          placeholder="Enter ID"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        /> */}
                        
                      </div> 

                      {/* 🔹 Buttons */}
                      <div className="flex justify-end w-full gap-4 mt-6">
                        <button
                          className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                          onClick={close}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => handleApproval(close)}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </Popup>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
<br></br>
      <div className="mt-6 text-sm text-gray-400">
        <span>Showing 1 to 10 of 21 entries</span>
        <br></br>
        <div className="mt-2 flex justify-end space-x-4">
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Export CSV</button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Export SQL</button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Export TXT</button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Export JSON</button>
        </div>
        <br></br>

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

export default SupplierHY;
