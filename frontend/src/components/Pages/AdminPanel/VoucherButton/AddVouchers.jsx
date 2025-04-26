import React, { useState } from "react";
import axios from "axios";

const AddVouchers = () => {
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState("");
  const [validDays, setValidDays] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle form input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "voucherCode") {
      setVoucherCode(value);
    } else if (id === "voucherValue") {
      setVoucherValue(value);
    } else if (id === "validDays") {
      setValidDays(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!voucherCode || !voucherValue || !validDays) {
      setError("All fields are required.");
      return;
    }

    try {
      // Send the voucher data to the backend API
      const response = await axios.post("http://localhost:5000/api/vouchers", {
        code: voucherCode,
        value: voucherValue,
        valid_days: validDays,
      });

      if (response.data.success) {
        setSuccessMessage("Voucher created successfully.");
        setError("");
        // Reset form fields after successful submission
        setVoucherCode("");
        setVoucherValue("");
        setValidDays("");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred while creating the voucher.");
      console.error("Error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="main-content flex-1 ml-64 transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Create Voucher</h2>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">
              Voucher Setup (Enter Details Below)
            </h3>

            <div className="mb-6">
              <div className="barcode-select-container">
                <input
                  type="text"
                  id="voucherCode"
                  value={voucherCode}
                  placeholder="Voucher Code"
                  className="p-2 border rounded-md w-1/3"
                  onChange={handleInputChange}
                />
              </div>
              <br />
              <div className="barcode-select-container">
                <input
                  type="number"
                  id="voucherValue"
                  value={voucherValue}
                  placeholder="Value (LKR)"
                  className="p-2 border rounded-md w-1/3"
                  onChange={handleInputChange}
                />
              </div>
              <br />
              <div className="barcode-select-container">
                <input
                  type="number"
                  id="validDays"
                  value={validDays}
                  placeholder="Validity Period (Days)"
                  className="p-2 border rounded-md w-1/3"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <br />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="bg-blue-600 text-white p-2 rounded-md"
                onClick={handleSubmit}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white p-2 rounded-md"
                onClick={() => {
                  setVoucherCode("");
                  setVoucherValue("");
                  setValidDays("");
                  setError("");
                  setSuccessMessage("");
                }}
              >
                New (Clear)
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {successMessage && (
              <p className="text-green-500 mt-4">{successMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVouchers;
