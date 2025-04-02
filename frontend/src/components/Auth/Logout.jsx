import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="logout-wrapper">
      <button className="logout-btn" onClick={() => setShowConfirm(true)}>
        Logout
      </button>

      {showConfirm && (
        <div className="logout-confirm">
          <p>Are you sure you want to logout?</p>
          <div className="logout-actions">
            <button
              className="cancel-btn"
              onClick={() => setShowConfirm(false)}
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
        .logout-btn {
          background: rgb(54, 143, 244);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .logout-confirm {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .logout-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: rgb(12, 49, 255);
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .confirm-btn {
          padding: 8px 16px;
          background: rgb(55, 102, 245);
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
