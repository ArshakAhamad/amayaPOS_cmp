import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const POS = () => {
  const [cashInHand, setCashInHand] = useState(0);
  const navigate = useNavigate(); // 

  const handleStartDay = () => {
    navigate("/AdminPanel/PosPay"); // 
  };

  return (
    <div className="main-content p-6">
      {/* Page Header */}
      <h2 className="sales-header text-2xl font-semibold text-center mb-6">POS</h2>

      {/* Date Input & Button */}
      <div className="sales-controls mb-6 flex flex-wrap items-center justify-between">
      <label className="text-lg font-medium">LKR</label>
        <input
          type="number"
          className="date-picker p-2 border rounded text-sm w-24"
          value={cashInHand}
          onChange={(e) => setCashInHand(e.target.value)}
        />
        <button
          onClick={handleStartDay}
          className="generate-btn p-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
        >
          Start the Day
        </button>
      </div>
    </div>
  );
};

export default POS;
