import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import logo from "/logo.png";

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [passwordIcon, setPasswordIcon] = useState(eyeOff);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        const role = response.data.user.role;
        setIsAuthenticated(true);
        setUserRole(role);
        navigate(role === "Admin" ? "/AdminPanel" : "/CashierPanel");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    }
  };

  const togglePasswordVisibility = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      setPasswordIcon(eye);
    } else {
      setPasswordType("password");
      setPasswordIcon(eyeOff);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="logo-section">
          <img src={logo} alt="CeylonX Logo" className="logo" width={300} />
          <h2 className="pos-title">POINT OF SALES</h2>
          <p className="signin-text">Sign in to continue</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: "12px",
              fontSize: "16px",
              backgroundColor: "#fff",
              color: "#333",
            }}
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={passwordType}
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px",
                fontSize: "16px",
                backgroundColor: "#fff",
                color: "#333",
              }}
            />
            <span
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            >
              <Icon icon={passwordIcon} size={20} />
            </span>
          </div>
        </div>

        <p className="login-alt">
          <a href="#" className="login-alt-link">
            Login as a different user
          </a>
        </p>

        <div className="form-buttons">
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
