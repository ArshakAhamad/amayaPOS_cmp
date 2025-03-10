import React, { useState } from "react";
import axios from "axios";

const Profile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the new password matches the confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      // Retrieve JWT token from localStorage
      const token = localStorage.getItem("jwt_token"); 

      if (!token) {
        setError("You need to be logged in to update your profile.");
        return;
      }

      // Make the PUT request to update the profile
      const response = await axios.put(
        "http://localhost:5000/api/profile", // Ensure the route is correct and accessible
        {
          username: formData.username,
          email: formData.email,
          password: formData.newPassword, // Only send newPassword if provided
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
          },
        }
      );

      // Handle success
      if (response.data.success) {
        setSuccessMessage("Profile updated successfully.");
        setError(""); // Clear any previous errors
      } else {
        setError(response.data.message || "An error occurred while updating the profile.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating the profile.");
    }
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

            {/* Username Field */}
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
            {/* Email Field */}
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
            {/* Current Password Field */}
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
            {/* New Password Field */}
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
            {/* Confirm Password Field */}
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

          {/* 🔷 Error/Success Message */}
          {error && (
            <div className="text-red-600 mb-4 text-center">
              <p>{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="text-green-600 mb-4 text-center">
              <p>{successMessage}</p>
            </div>
          )}

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

export default Profile;
