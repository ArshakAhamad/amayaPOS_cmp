import React, { useState } from "react";

const CreateStore = () => {
  const [storeDetails, setStoreDetails] = useState({
    storeName: "",
    description: "",
    storeType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreDetails({
      ...storeDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeDetails),
      });

      const data = await response.json();
      if (data.success) {
        alert("Store created successfully!");
        setStoreDetails({ storeName: "", description: "", storeType: "" });
      } else {
        alert("Failed to create store: " + data.message);
      }
    } catch (err) {
      console.error("Error creating store:", err);
      alert("Server error. Please try again.");
    }
  };

  const handleResetForm = () => {
    setStoreDetails({ storeName: "", description: "", storeType: "" });
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with improved visual hierarchy */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Add a new store to your system</p>
          </div>

          {/* Store Name */}
          <div>
            <label
              htmlFor="storeName"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="storeName"
              value={storeDetails.storeName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Store name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              name="description"
              value={storeDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description"
              rows="3"
            />
          </div>

          {/* Store Type */}
          <div>
            <label
              htmlFor="storeType"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Store Type <span className="text-red-500">*</span>
            </label>
            <select
              name="storeType"
              value={storeDetails.storeType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose store type</option>
              <option value="Factory">Factory</option>
              <option value="Store">Store</option>
              <option value="Dealer Store">Dealer Store</option>
            </select>
          </div>

          {/* Buttons with increased spacing and tooltips */}
          <div className="flex justify-end gap-6 mt-8">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              title="Clear form and start new store entry"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              title="Save store details"
            >
              Save Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStore;
