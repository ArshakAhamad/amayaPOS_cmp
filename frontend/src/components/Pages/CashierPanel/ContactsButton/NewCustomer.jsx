import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const NewCustomer = () => {
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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

        // Navigate back to payment page with customer data
        if (location.state?.fromPayment) {
          navigate("/CashierPanel/PosPay", {
            state: {
              customerPhone: customerDetails.phone,
              customerName: customerDetails.customerName,
            },
          });
        } else {
          setCustomerDetails({ customerName: "", phone: "", address: "" });
        }
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

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        {/* 🔷 Customer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🔷 Centered Heading */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-700">
              Create Customer
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              You can create New Customers from here
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={customerDetails.customerName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Customer Name"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={customerDetails.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Phone Number"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={customerDetails.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Address"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              New
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
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
