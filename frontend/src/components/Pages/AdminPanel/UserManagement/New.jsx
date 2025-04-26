import React, { useState } from "react";
import axios from "axios";

const NewSalesRep = () => {
  const [salesRepDetails, setSalesRepDetails] = useState({
    name: "",
    username: "",
    store: "",
    description: "",
    email: "",
    phone: "",
    remarks: "",
    notificationMethod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSalesRepDetails({
      ...salesRepDetails,
      [name]: value,
    });
  };

  const generateRandomPassword = () => {
    const length = 10;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate password if manual notification is selected
      let generatedPassword = null;
      if (salesRepDetails.notificationMethod === "manual") {
        generatedPassword = generateRandomPassword();
        alert(
          `Manual credentials created:\n\nUsername: ${salesRepDetails.username}\nPassword: ${generatedPassword}`
        );
      }

      const response = await axios.post(
        "http://localhost:5000/api/sales-rep",
        {
          ...salesRepDetails,
          generatedPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert("Sales Rep added successfully!");
        // Reset form
        setSalesRepDetails({
          name: "",
          username: "",
          store: "",
          description: "",
          email: "",
          phone: "",
          remarks: "",
          notificationMethod: "",
        });
      } else {
        alert(response.data.message || "Failed to add Sales Rep.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response) {
        if (error.response.status === 400) {
          alert(
            `Validation Error: ${
              error.response.data.message || "Invalid data submitted"
            }`
          );
        } else if (error.response.status === 500) {
          alert("Server Error: Please try again later");
        }
      } else if (error.request) {
        alert("Network Error: Please check your connection");
      } else {
        alert("Application Error: " + error.message);
      }
    }
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-700">
            Sales Rep Setup
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a new sales representative account
          </p>

          {/* Name & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
                <span
                  className="text-xs text-gray-500 ml-1"
                  title="Cannot be changed after creation"
                >
                  {" "}
                  (Permanent)
                </span>
              </label>
              <input
                type="text"
                name="name"
                value={salesRepDetails.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="username"
                value={salesRepDetails.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Sales representative name"
                required
              />
            </div>
          </div>

          {/* Assign Store */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Store
            </label>
            <select
              name="store"
              value={salesRepDetails.store}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select store</option>
              <option value="Sales Person Store">Sales Person Store</option>
              <option value="Another Store">Another Store</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={salesRepDetails.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Optional description"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={salesRepDetails.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Email address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={salesRepDetails.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={salesRepDetails.remarks}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Optional notes"
            />
          </div>

          {/* Notification Method */}
          <div className="flex flex-col space-y-2 mt-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="notificationMethod"
                value="email"
                checked={salesRepDetails.notificationMethod === "email"}
                onChange={handleChange}
                className="mr-2 w-5 h-5 accent-blue-600"
              />
              Email login details to the sales rep
            </label>{" "}
            <br></br>
            <label className="flex items-center">
              <input
                type="radio"
                name="notificationMethod"
                value="manual"
                checked={salesRepDetails.notificationMethod === "manual"}
                onChange={handleChange}
                className="mr-2 w-5 h-5 accent-blue-600"
              />
              Send the login details manually as notification
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Clear Form
            </button>{" "}
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              title="Save the sales representative details"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSalesRep;
