import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import logo from "/logo.png";

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      console.log("API Response:", response.data); // Debug: Log the API response

      if (response.data.success) {
        // Save the token in localStorage
        localStorage.setItem("token", response.data.token);

        // Extract the role from the user object
        const role = response.data.user.role; // Ensure the backend includes the role field

        // Set authentication status and user role
        setIsAuthenticated(true);
        setUserRole(role);

        console.log("User Role:", role); // Debug: Log the user role
        console.log("Navigating to:", role === "Admin" ? "/AdminPanel" : "/CashierPanel"); // Debug: Log the navigation path

        // Redirect based on role
        navigate(role === "Admin" ? "/AdminPanel" : "/CashierPanel");
      } else {
        setError(response.data.message); // Set error message from the API response
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      {/* Form Container */}
      <form className="login-form" onSubmit={handleLogin}>
        {/* Logo Section */}
        <div className="logo-section">
          <img src={logo} alt="CeylonX Logo" className="logo" width={300} />
          <h2 className="pos-title">POINT OF SALES</h2>
          <p className="signin-text">Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Username Input */}
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login as Different User */}
        <p className="login-alt">
          <a href="#" className="login-alt-link">Login as a different user</a>
        </p>

        {/* Login Button */}
        <div className="form-buttons">
          <button type="submit">Log In</button>
        </div>
      </form>
    </div>
  );
};

export default Login;