import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const POS = () => {
  const [cashInHand, setCashInHand] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [isSalesRep, setIsSalesRep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("/api/auth/check-role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to verify role");
        }

        setUserRole(response.data.role);
        setIsSalesRep(response.data.isSalesRep);
        
        if (response.data.role === "Admin" && !response.data.isSalesRep) {
          alert("You have no store allocated or you are not a Sales Rep. Please Contact Administrator. E1000");
        }
      } catch (error) {
        console.error("Role check failed:", error);
        setError(error.message);
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate]);

  const handleStartDay = () => {
    if (userRole === "Admin" && !isSalesRep) {
      alert("You have no store allocated or you are not a Sales Rep. Please Contact Administrator. E1000");
      return;
    }
    navigate("/AdminPanel/PosPay", { state: { cashInHand } });
  };

  if (loading) {
    return <div className="main-content p-6">Loading user permissions...</div>;
  }

  if (error) {
    return <div className="main-content p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="main-content p-6">
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">POS</h2>

      <div className="sales-controls mb-6 flex flex-wrap items-center justify-between">
        <label className="text-lg font-medium">LKR</label>
        <input
          type="number"
          className="date-picker p-2 border rounded text-sm w-24"
          value={cashInHand}
          onChange={(e) => setCashInHand(e.target.value)}
          disabled={userRole === "Admin" && !isSalesRep}
        />
        <button
          onClick={handleStartDay}
          className={`generate-btn p-2 text-white rounded ${
            (userRole === "Admin" && !isSalesRep) 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-red-500 hover:bg-red-600 cursor-pointer"
          }`}
          disabled={userRole === "Admin" && !isSalesRep}
        >
          Start the Day
        </button>
      </div>
    </div>
  );
};

export default POS;