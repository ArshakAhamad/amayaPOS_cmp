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
      const token = localStorage.getItem("token"); // Use 'token' as saved during login

      if (!token) {
        setError("You need to be logged in to update your profile.");
        return;
      }

      // Make the PUT request to update the profile
      const response = await axios.put(
        "http://localhost:5000/api/profile",
        {
          username: formData.username,
          email: formData.email,
          password: formData.newPassword, // Only send newPassword if provided
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token as Bearer
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
      setError("An error occurred while updating the profile.");
      console.error("Profile update error:", err);
    }
  };

  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-center mb-4">Profile</h2>
          <h3 className="text-lg font-medium text-gray-600 text-center mb-2">Authentication Settings</h3>
          <p className="text-sm text-gray-500 text-center mb-6">Change your password below</p>

          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <br></br>
          {/* Error and Success Messages */}
          {error && <p>{error}</p>}
          {successMessage && <p>{successMessage}</p>}

          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
