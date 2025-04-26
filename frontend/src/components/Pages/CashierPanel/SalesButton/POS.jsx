import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const POS = () => {
  const [cashInHand, setCashInHand] = useState("");
  const [isDayStarted, setIsDayStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check day status on component mount
  useEffect(() => {
    const checkDayStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/daily_openings/check"
        );

        if (response.data.success) {
          setIsDayStarted(response.data.isDayStarted);
          if (response.data.isDayStarted) {
            navigate("/CashierPanel/PosPay");
          }
        }
      } catch (err) {
        // Handle 404 specifically
        if (err.response?.status === 404) {
          setError("Daily openings endpoint not found - check backend");
        } else {
          setError("Failed to check day status");
        }
        console.error("Day status check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkDayStatus();
  }, [navigate]);

  const handleStartDay = async () => {
    if (!cashInHand || isNaN(cashInHand)) {
      setError("Please enter a valid cash amount");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/daily_openings",
        { cashInHand: parseFloat(cashInHand) }
      );

      if (response.data.success) {
        navigate("/CashierPanel/PosPay");
      } else {
        setError(response.data.message || "Failed to start day");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start day");
      console.error("Error starting day:", err);
    }
  };

  if (loading) {
    return <div className="main-content p-6">Checking day status...</div>;
  }

  if (error) {
    return (
      <div className="main-content p-6">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="main-content p-6">
      <div className="flex flex-col items-center">
        <div className="mb-4 w-64">
          <label className="block mb-2">Opening Cash Amount (LKR)</label>{" "}
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={cashInHand}
            onChange={(e) => setCashInHand(e.target.value)}
            min="0"
            step="0.01"
            placeholder="Enter amount"
          />
        </div>

        <button
          onClick={handleStartDay}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!cashInHand}
        >
          Start the Day
        </button>
      </div>
    </div>
  );
};

export default POS;
