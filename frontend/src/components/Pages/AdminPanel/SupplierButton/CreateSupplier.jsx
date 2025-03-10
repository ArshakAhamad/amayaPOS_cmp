import React, { useState } from 'react';

const CreateSupplier = () => {
  const [supplierDetails, setSupplierDetails] = useState({
    supplierName: '',
    creditPeriod: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierDetails({
      ...supplierDetails,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(supplierDetails); // Handle form submission logic
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        

        {/* 🔷 Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 🔷 Centered Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-700">Create Supplier</h3>
          <p className="text-sm text-gray-500 mt-1">You can create New Suppliers from here</p>
        </div>
        <br></br>
         {/* Supplier Name */}
<div>
  <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700">
    Supplier Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="supplierName"
    value={supplierDetails.supplierName}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg text-base" // ✅ Ensure consistent font size
    placeholder="Enter Supplier Name"
    required
  />
</div>

{/* Credit Period */}
<div>
  <label htmlFor="creditPeriod" className="block text-sm font-medium text-gray-700">
    Credit Period (No of Days) <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    name="creditPeriod"
    value={supplierDetails.creditPeriod}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg text-base" // ✅ Ensure consistent font size
    placeholder="Enter Credit Period"
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
    value={supplierDetails.description}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg text-base" // ✅ Apply same font as input fields
    placeholder="Enter Supplier Description"
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

export default CreateSupplier;
