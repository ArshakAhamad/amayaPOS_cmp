import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = ({ setIsAuthenticated, setUserRole, setUsername }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(true);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    // Reset states
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername("");

    navigate("/Login");
  };

  return (
    <div className="logout-wrapper">
      {showConfirm && (
        <div className="logout-confirm">
          <p>Are you sure you want to logout?</p>
          <div className="logout-actions">
            <button
              className="cancel-btn"
              onClick={() => {
                setShowConfirm(false);
                navigate(-1); // Go back to previous page
              }}
            >
              Cancel
            </button>
            <button className="confirm-btn" onClick={handleLogout}>
              Yes, Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .logout-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .logout-confirm {
          background: white;
          padding: 24px;
          border-radius: 8px;
          width: 320px;
          max-width: 90%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .logout-confirm p {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        .logout-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        .cancel-btn {
          padding: 8px 16px;
          background: #f0f0f0;
          color: #333;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cancel-btn:hover {
          background: #e0e0e0;
        }
        .confirm-btn {
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .confirm-btn:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default Logout;
