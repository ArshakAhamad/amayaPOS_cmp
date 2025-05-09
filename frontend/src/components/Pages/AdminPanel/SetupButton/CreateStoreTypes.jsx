import React, { useState } from "react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/store-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeTypeName: storeTypeDetails.storeTypeName,
          description: storeTypeDetails.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Store type created successfully!");
        setStoreTypeDetails({ storeTypeName: "", description: "" });
      } else {
        alert("Store type created successfully! ");
      }
    } catch (err) {
      console.error("Error creating store type:", err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        {/* 🔷 Centered Header */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mt-1">
            You can create new store types from here
          </p>
        </div>

        {/* 🔷 Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Type Name */}
          <div>
            <label
              htmlFor="storeTypeName"
              className="block text-sm font-medium text-gray-700"
            >
              Store Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="storeTypeName"
              id="storeTypeName"
              value={storeTypeDetails.storeTypeName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder=" Store Type Name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={storeTypeDetails.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="About this store type"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() =>
                setStoreTypeDetails({ storeTypeName: "", description: "" })
              }
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Clear form
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
