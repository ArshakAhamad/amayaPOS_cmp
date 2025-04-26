import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(true); // Set to true by default

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="logout-wrapper">
      {/* Confirmation dialog shows immediately */}
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
        }

        .logout-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: rgb(231, 231, 231);
          color: #333;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .confirm-btn {
          padding: 8px 16px;
          background: rgb(0, 17, 255);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Logout;
