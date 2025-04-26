import React, { useState } from "react";
import axios from "axios";

const CreateSupplier = () => {
  const [supplierDetails, setSupplierDetails] = useState({
    supplierName: "",
    creditPeriod: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierDetails({
      ...supplierDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/suppliers", {
        supplierName: supplierDetails.supplierName,
        creditPeriod: supplierDetails.creditPeriod,
        description: supplierDetails.description,
      });

      if (response.data.success) {
        setSuccessMessage("Supplier created successfully!");
        setSupplierDetails({
          supplierName: "",
          creditPeriod: "",
          description: "",
        });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the supplier.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSupplierDetails({ supplierName: "", creditPeriod: "", description: "" });
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with improved visual hierarchy */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create New Supplier
            </h1>
            <p className="text-gray-600">Add a new supplier to your system</p>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
              {successMessage}
            </div>
          )}

          {/* Supplier Name */}
          <div>
            <label
              htmlFor="supplierName"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplierName"
              value={supplierDetails.supplierName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Supplier name"
              required
            />
          </div>

          {/* Credit Period */}
          <div>
            <label
              htmlFor="creditPeriod"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Credit Period (Days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="creditPeriod"
              value={supplierDetails.creditPeriod}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of days"
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
              value={supplierDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional supplier details"
              rows="3"
            />
          </div>

          {/* Buttons with increased spacing and tooltips */}
          <div className="flex justify-end gap-6 mt-8">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              title="Clear form and start new supplier entry"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={loading}
              title="Save supplier details"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Supplier"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplier;
