import React, { useState } from "react";

const CashierProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md">
        

        {/* 🔷 Profile Form */}
        <form onSubmit={handleSubmit}>

          <div className="mb-4">
             {/* 🔷 Header */}
        <h2 className="text-2xl font-semibold text-center mb-4">Profile</h2>
        <h3 className="text-lg font-medium text-gray-600 text-center mb-2">Authentication Settings</h3>
        <p className="text-sm text-gray-500 text-center mb-6">Change your password below</p>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-900">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a new password"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your new password"
              required
            />
          </div>

          {/* 🔷 Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
          >
            Change Password
          </button>

        </form>
      </div>
    </div>
  );
};

export default CashierProfile;
