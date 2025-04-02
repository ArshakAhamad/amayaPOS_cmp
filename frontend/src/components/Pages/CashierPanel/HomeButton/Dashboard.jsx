import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../../../../../backend/models/api';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [salesData, setSalesData] = useState({
    productSale: 0,
    voucherSale: 0,
    totalPurchaseDue: 0,
    totalReceipts: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlySales: Array(12).fill(0)
  });

  const [cashierData, setCashierData] = useState([]);
  const [loading, setLoading] = useState({
    dashboard: true,
    cashiers: true
  });
  const [error, setError] = useState({
    dashboard: null,
    cashiers: null
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    // Fetch dashboard summary data
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/dashboard/summary');
        if (response.data.success) {
          setSalesData(response.data.data);
        } else {
          setError(prev => ({...prev, dashboard: response.data.message}));
        }
      } catch (err) {
        setError(prev => ({
          ...prev, 
          dashboard: err.response?.data?.message || 'Failed to load dashboard data'
        }));
      } finally {
        setLoading(prev => ({...prev, dashboard: false}));
      }
    };

    // Fetch cashier data
    const fetchCashierData = async () => {
      try {
        const response = await api.get('/api/dashboard/cashiers');
        if (response.data.success) {
          setCashierData(response.data.data);
        } else {
          setError(prev => ({...prev, cashiers: response.data.message}));
        }
      } catch (err) {
        setError(prev => ({
          ...prev, 
          cashiers: err.response?.data?.message || 'Failed to load cashier data'
        }));
      } finally {
        setLoading(prev => ({...prev, cashiers: false}));
      }
    };

    fetchDashboardData();
    fetchCashierData();
  }, []);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Sales (LKR)',
        data: salesData.monthlySales,
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30, 58, 138, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top' 
      },
      tooltip: {
        callbacks: {
          label: (context) => `LKR ${context.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          callback: (value) => `LKR ${value.toFixed(2)}`
        }
      },
    },
  };

  return (
    <div className="dashboard-container p-6">
      {/* Error Messages */}
      {error.dashboard && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>Dashboard Error: {error.dashboard}</p>
        </div>
      )}
      {error.cashiers && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>Cashiers Error: {error.cashiers}</p>
        </div>
      )}

      {/* Dashboard Cards Section */}
      <div className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Product Sales</h3>
          {loading.dashboard ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-bold">LKR {salesData.productSale.toFixed(2)}</p>
          )}
        </div>
        
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Voucher Sales</h3>
          {loading.dashboard ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-bold">LKR {salesData.voucherSale.toFixed(2)}</p>
          )}
        </div>
        
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Total Products</h3>
          {loading.dashboard ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-bold">{salesData.totalProducts}</p>
          )}
        </div>
        
        <div className="dashboard-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Total Customers</h3>
          {loading.dashboard ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-bold">{salesData.totalCustomers}</p>
          )}
        </div>
      </div>

      {/* Monthly Sales Graph */}
      <div className="monthly-sales mt-6 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Monthly Sales</h3>
        <div className="w-full h-[500px] md:h-[450px] lg:h-[500px]"> 
          {loading.dashboard ? (
            <div className="animate-pulse h-full w-full bg-gray-200 rounded"></div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Cashier Summary Section */}
      <div className="cashier-summary mt-6">
        <div className="cashier-summary mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading.cashiers ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-md">
                <div className="animate-pulse h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="animate-pulse h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="animate-pulse h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
              </div>
            ))
          ) : error.cashiers ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">{error.cashiers}</p>
            </div>
          ) : cashierData.length > 0 ? (
            cashierData.map((cashier, index) => (
              <div key={index} className="cashier-card p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-3">{cashier.name}</h3>
                <p className="mb-1">Total Sales: <span className="font-semibold">LKR {cashier.sale.toFixed(2)}</span></p>
                <p className="mb-1">Cash: <span className="font-semibold">LKR {cashier.cash.toFixed(2)}</span></p>
                <p>Vouchers: <span className="font-semibold">LKR {cashier.voucher.toFixed(2)}</span></p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No cashier data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;