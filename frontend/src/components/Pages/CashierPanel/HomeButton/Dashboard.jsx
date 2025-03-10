import React from 'react';
import { Line } from 'react-chartjs-2'; // Import Line chart
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register required components for Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CashierDashboard = () => {
  // Simulated data for Dashboard components
  const salesData = {
    productSale: 0.00,
    voucherSale: 0.00,
    totalPurchaseDue: 13001703703.52,
    totalReceipts: 0,
    totalProducts: 939,
    totalCustomers: 1,
    monthlySales: [1000, 1200, 800, 1500, 2000, 2200, 2500, 2700, 3000, 3200, 4000, 4500], // Example sales data
  };

  const cashierData = [
    { name: 'Niluka', sale: 0.00, cash: 0.00, voucher: 0.00 },
    { name: 'Rajitha', sale: 0.00, cash: 0.00, voucher: 0.00 },
    { name: 'Thisal', sale: 0.00, cash: 0.00, voucher: 0.00 },
  ];

  // Chart Data Configuration
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Sales',
        data: salesData.monthlySales,
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30, 58, 138, 0.2)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="dashboard-container p-6">
      {/* Dashboard Cards Section */}
      <div className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card">
          <h3 className="text-lg">Product Sale</h3>
          <p className="text-xl">Rs. {salesData.productSale.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h3 className="text-lg">Voucher Sale</h3>
          <p className="text-xl">Rs. {salesData.voucherSale.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h3 className="text-lg">Total Purchase Due</h3>
          <p className="text-xl">Rs. {salesData.totalPurchaseDue.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h3 className="text-lg">Total Products</h3>
          <p className="text-xl">{salesData.totalProducts}</p>
        </div>
      </div>

      {/* Monthly Sales Graph Section */}
      <div className="monthly-sales mt-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg mb-4">Monthly Sales</h3>
        <div className="w-full h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Cashier Summary Section */}
      <div className="cashier-summary mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashierData.map((cashier, index) => (
          <div key={index} className="cashier-card p-4 border border-gray-200 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">{`Cashier: ${cashier.name}`}</h3>
            <p>Sale: LKR {cashier.sale.toFixed(2)}</p>
            <p>Cash: LKR {cashier.cash.toFixed(2)}</p>
            <p>Voucher: LKR {cashier.voucher.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashierDashboard;
