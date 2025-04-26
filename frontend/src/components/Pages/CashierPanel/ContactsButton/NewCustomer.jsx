import React, { useState } from "react";
import axios from "axios";

const NewCustomer = () => {
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({
      ...customerDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/customers",
        customerDetails
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType("success");
        setCustomerDetails({ customerName: "", phone: "", address: "" });
      } else {
        setMessage(response.data.message);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("An error occurred while creating the customer.");
      setMessageType("error");
      console.error("Error creating customer:", err);
    }
  };

  const handleClearForm = () => {
    setCustomerDetails({
      customerName: "",
      phone: "",
      address: "",
    });
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Add a new customer to your system</p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                name="customerName"
                value={customerDetails.customerName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer name"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={customerDetails.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone number"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={customerDetails.address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer address (optional)"
                rows="3"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 gap-6">
            <button
              type="button"
              onClick={handleClearForm}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              title="Clear the form and start a new customer entry"
            >
              Clear Form
            </button>

            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              title="Save the current customer details"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomer;
