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
      const response = await fetch('http://localhost:5000/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeDetails),
      });

      const data = await response.json();
      if (data.success) {
        alert('Store created successfully!');
        setStoreDetails({ storeName: '', description: '', storeType: '' }); // Reset form
      } else {
        alert('Failed to create store: ' + data.message);
      }
    } catch (err) {
      console.error('Error creating store:', err);
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-700">Store Setup</h3>
            <p className="text-sm text-gray-500 mt-1">You can create new stores from here</p>
          </div>
          <br />

          {/* Store Name */}
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="storeName"
              value={storeDetails.storeName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Store Name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={storeDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Store Description"
            />
          </div>

          {/* Store Type */}
          <div>
            <label htmlFor="storeType" className="block text-sm font-medium text-gray-700">
              Store Type <span className="text-red-500">*</span>
            </label>
            <select
              name="storeType"
              value={storeDetails.storeType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Store Type</option>
              <option value="Factory">Factory</option>
              <option value="Store">Store</option>
              <option value="Dealer Store">Dealer Store</option> {/* Updated */}
            </select>
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

export default CreateStore;