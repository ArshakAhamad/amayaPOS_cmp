import React, { useState } from "react";

const CashierNewSalesRep = () => {
  const [salesRepDetails, setSalesRepDetails] = useState({
    name: "",
    username: "",
    store: "",
    description: "",
    email: "",
    phone: "",
    remarks: "",
    notificationMethod: "", // ✅ New state for radio button selection
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSalesRepDetails({
      ...salesRepDetails,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(salesRepDetails);
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        {/* 🔷 Sales Rep Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-700">Sales Rep Setup</h3>
          <p className="text-sm text-gray-500 mt-1">
            You can create a New Sales Rep from here
          </p>
          <br />

          {/* Name & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sales Rep Name
              </label>
              <input
                type="text"
                name="name"
                value={salesRepDetails.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter Sales Rep Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={salesRepDetails.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter Username"
                required
              />
              <p className="text-xs text-gray-500">Username cannot be changed once created</p>
            </div>
          </div>

          {/* Select Store */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Allocate Store</label>
            <select
              name="store"
              value={salesRepDetails.store}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Store</option>
              <option value="Sales Person Store">Sales Person Store</option>
              <option value="Another Store">Another Store</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={salesRepDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Description"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={salesRepDetails.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter Email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={salesRepDetails.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter Phone Number"
                required
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea
              name="remarks"
              value={salesRepDetails.remarks}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Remarks"
            />
          </div>

          <div className="flex flex-col space-y-2">
  <label className="flex items-center">
    
      <input
        type="radio"
        name="notificationMethod"
        value="email"
        checked={salesRepDetails.notificationMethod === "email"}
        onChange={handleChange}
        className="mr-2 w-5 h-5 accent-blue-600"
      />
      <h4>
      Send an email notification with login details to the Sales Rep</h4>
  </label>

  <label className="flex items-center">
    
    <input
      type="radio"
      name="notificationMethod"
      value="manual"
      checked={salesRepDetails.notificationMethod === "manual"}
      onChange={handleChange}
      className="mr-2 w-5 h-5 accent-blue-600"
    />
    <h4>Send login details to the Sales Rep manually</h4>
  </label>
</div>


          {/* Buttons */}
        
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
          >
            New
          </button>
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
          >
            Save
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default CashierNewSalesRep;
