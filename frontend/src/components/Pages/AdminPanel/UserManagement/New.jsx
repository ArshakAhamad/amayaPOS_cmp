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
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
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
        alert(`Manual credentials created:\n\nUsername: ${salesRepDetails.username}\nPassword: ${generatedPassword}`);
      }
  
      const response = await axios.post(
        "http://localhost:5000/api/sales-rep",
        {
          ...salesRepDetails,
          generatedPassword
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
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.log("Error data:", error.response.data);
        console.log("Error status:", error.response.status);
        console.log("Error headers:", error.response.headers);
        
        if (error.response.status === 400) {
          alert(`Validation Error: ${error.response.data.message || 'Invalid data submitted'}`);
        } else if (error.response.status === 500) {
          alert('Server Error: Please try again later');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request);
        alert('Network Error: Please check your connection');
      } else {
        // Something happened in setting up the request
        console.log('Error message:', error.message);
        alert('Application Error: ' + error.message);
      }
    }
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
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

{/* Notification Method */}
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
              <h4>Send an email notification with login details to the Sales Rep</h4>
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

          {/* Submit buttons */}
          <button type="submit" className="w-full py-3 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            New
          </button>
          <button type="submit" className="w-full py-3 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewSalesRep;
