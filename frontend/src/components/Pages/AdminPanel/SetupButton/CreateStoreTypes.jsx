import React, { useState } from 'react';

const CreateStoreTypes = () => {
  const [storeTypeDetails, setStoreTypeDetails] = useState({
    storeTypeName: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreTypeDetails({
      ...storeTypeDetails,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(storeTypeDetails);
    // Handle your store type creation logic here
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        

        {/* 🔷 Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 🔷 Centered Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-700">Create Store Type</h3>
          <p className="text-sm text-gray-500 mt-1">You can create new store types from here</p>
        </div>
          <br></br>
          {/* Store Type Name */}
          <div>
            <label htmlFor="storeTypeName" className="block text-sm font-medium text-gray-700">
              Store Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="storeTypeName"
              value={storeTypeDetails.storeTypeName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Store Type Name"
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
              value={storeTypeDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Store Type Description"
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

export default CreateStoreTypes;
