import React, { useState } from "react";
import axios from "axios"; // Import axios for API calls

const CreateCategory = () => {
  const [categoryDetails, setCategoryDetails] = useState({
    categoryName: "",
    description: "",
  });

  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryDetails({
      ...categoryDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true during the request

    try {
      // Prepare the data to send to the backend
      const payload = {
        categoryName: categoryDetails.categoryName,
        description: categoryDetails.description,
        createdBy: "Admin", // Default value for created_by
        status: "Active", // Default value for status
      };

      // Send the category details to the backend API
      const response = await axios.post("http://localhost:5000/api/categories", payload);

      // Handle the response
      if (response.data.success) {
        alert("Category created successfully!"); // Show success alert
        console.log("Category created successfully:", response.data.message);
        // Clear the form
        setCategoryDetails({ categoryName: "", description: "" });
      } else {
        alert(response.data.message || "Failed to create category."); // Show error alert
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("An error occurred while creating the category."); // Show error alert
    } finally {
      setLoading(false); // Set loading to false once the request is complete
    }
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        {/* 🔷 Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🔷 Centered Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Create Category</h2>
            <p className="text-sm text-gray-500 mt-1">You can create new categories from here</p>
          </div>

          {/* 🔷 Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span> (Minimum 3 Characters)
            </label>
            <input
              type="text"
              name="categoryName"
              value={categoryDetails.categoryName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Category Name"
              required
            />
          </div>

          {/* 🔷 Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={categoryDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Description"
            />
          </div>

          {/* 🔷 Buttons */}
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
              disabled={loading} // Disable the button while loading
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;