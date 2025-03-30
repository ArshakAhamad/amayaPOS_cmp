import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {
      productSale: 0,
      voucherSale: 0,
      totalPurchaseDue: 0,
      totalProducts: 0,
      totalCustomers: 0
    },
    monthlySales: Array(12).fill(0),
    cashiers: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, monthlyRes, cashierRes] = await Promise.all([
          axios.get('/api/dashboard/summary'),
          axios.get('/api/dashboard/monthly-sales'),
          axios.get('/api/dashboard/cashier-summary')
        ]);

        setDashboardData({
          summary: summaryRes.data?.data || {
            productSale: 0,
            voucherSale: 0,
            totalPurchaseDue: 0,
            totalProducts: 0,
            totalCustomers: 0
          },
          monthlySales: monthlyRes.data?.data || Array(12).fill(0),
          cashiers: cashierRes.data?.data || []
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safe number formatting function
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'LKR 0.00';
    return `LKR ${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Sales (LKR)',
        data: dashboardData.monthlySales,
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30, 58, 138, 0.2)',
        borderWidth: 2,
        fill: true,
        innerHeight: 10,
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
      y: { 
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="dashboard-container p-6">
      {/* Dashboard Cards Section */}
      <div className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Product Sales</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.productSale)}
          </p>
        </div>
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Voucher Sales</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.voucherSale)}
          </p>
        </div>
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Purchase Due</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.totalPurchaseDue)}
          </p>
        </div>
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
          <p className="text-2xl font-bold">
            {dashboardData.summary.totalProducts || 0}
          </p>
        </div>
      </div>

      {/* Monthly Sales Graph */}
      <div className="monthly-sales mt-6 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
        <div className="w-full h-[500px] md:h-[450px] lg:h-[500px]"> 
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Cashier Summary Section */}
      <div className="cashier-summary mt-6">
        <h3 className="text-lg font-semibold mb-4">Cashier Performance (Last 30 Days)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.cashiers.map((cashier, index) => (
            <div key={index} className="cashier-card p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800">{cashier.name || 'Unknown Cashier'}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600">
                  Total Sales: <span className="font-medium">{formatCurrency(cashier.sale)}</span>
                </p>
                <p className="text-gray-600">
                  Cash: <span className="font-medium">{formatCurrency(cashier.cash)}</span>
                </p>
                <p className="text-gray-600">
                  Card: <span className="font-medium">{formatCurrency(cashier.card)}</span>
                </p>
                <p className="text-gray-600">
                  Voucher: <span className="font-medium">{formatCurrency(cashier.voucher)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;