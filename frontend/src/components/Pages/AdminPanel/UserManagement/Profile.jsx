import React, { useState } from "react";
import axios from "axios";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";

const Profile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordType, setPasswordType] = useState({
    currentPassword: "password",
    newPassword: "password",
    confirmPassword: "password",
  });

  const [passwordIcon, setPasswordIcon] = useState({
    currentPassword: eyeOff,
    newPassword: eyeOff,
    confirmPassword: eyeOff,
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordType((prev) => ({
      ...prev,
      [field]: prev[field] === "password" ? "text" : "password",
    }));
    setPasswordIcon((prev) => ({
      ...prev,
      [field]: prev[field] === eyeOff ? eye : eyeOff,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You need to be logged in to update your profile.");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/profile",
        {
          username: formData.username,
          email: formData.email,
          password: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Profile updated successfully.");
        setError("");
      } else {
        setError(
          response.data.message ||
            "An error occurred while updating the profile."
        );
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
          <h3 className="text-lg font-medium text-gray-600 text-center mb-2">
            Authentication Settings
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Change your password below
          </p>

          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={passwordType.currentPassword}
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
              />
              <span
                className="password-toggle-icon1"
                onClick={() => togglePasswordVisibility("currentPassword")}
              >
                <Icon icon={passwordIcon.currentPassword} size={20} />
              </span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={passwordType.newPassword}
                id="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
              <span
                className="password-toggle-icon1"
                onClick={() => togglePasswordVisibility("newPassword")}
              >
                <Icon icon={passwordIcon.newPassword} size={20} />
              </span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={passwordType.confirmPassword}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <span
                className="password-toggle-icon1"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                <Icon icon={passwordIcon.confirmPassword} size={20} />
              </span>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
