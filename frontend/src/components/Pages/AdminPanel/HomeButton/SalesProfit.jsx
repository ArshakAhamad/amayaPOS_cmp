import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';

const SalesProfit = () => {
  // Set default dates (last 7 days)
  const defaultStartDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const defaultEndDate = format(new Date(), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test API connection on mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await axios.get('/api/sales/test');
        console.log('API Connection Test:', response.data);
      } catch (err) {
        console.error('API Connection Failed:', err);
        setError('Failed to connect to server. Check your connection.');
      }
    };
    testApiConnection();
  }, []);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/sales', {
        params: {
          startDate: format(new Date(startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(endDate), 'yyyy-MM-dd')
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
          try {
            return JSON.parse(data);
          } catch (err) {
            throw new Error(`Invalid JSON: ${data}`);
          }
        }],
        timeout: 10000
      });

      console.log('Full API Response:', response);

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error(`Invalid response: ${typeof response.data}`);
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }

      // Validate summary data
      const requiredSummaryFields = [
        'productSales', 'voucherSales', 'cost', 'profit', 'profitPercentage'
      ];
      
      const missingFields = requiredSummaryFields.filter(
        field => !(field in response.data.summary)
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }

      // Process sales data
      const processedSales = Array.isArray(response.data.sales) 
        ? response.data.sales.map(sale => ({
            id: sale.id || 0,
            date: sale.date || format(new Date(), 'yyyy-MM-dd'),
            type: sale.type || 'Sale',
            reference: sale.reference?.toString() || '',
            sale: Number(sale.sale) || 0,
            discount: Number(sale.discount) || 0,
            cost: Number(sale.cost) || 0,
            profit: Number(sale.profit) || 0,
            profitPercentage: Number(sale.profitPercentage) || 0
          }))
        : [];

      setSummary({
        productSales: Number(response.data.summary.productSales) || 0,
        voucherSales: Number(response.data.summary.voucherSales) || 0,
        cost: Number(response.data.summary.cost) || 0,
        profit: Number(response.data.summary.profit) || 0,
        profitPercentage: Number(response.data.summary.profitPercentage) || 0
      });

      setSalesData(processedSales);

    } catch (err) {
      let errorMessage = 'Failed to load data';
      
      if (err.response) {
        // Handle HTTP error responses
        if (typeof err.response.data === 'string') {
          errorMessage = `Server error: ${err.response.data}`;
        } else {
          errorMessage = err.response.data?.message || 
                        `Error ${err.response.status}`;
        }
      } else if (err.request) {
        // Handle no response errors
        errorMessage = 'No response from server';
      } else {
        // Handle other errors
        errorMessage = err.message || 'Unknown error';
      }
      
      setError(errorMessage);
      console.error('Sales Report Error:', {
        error: err,
        config: err.config,
        response: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  // Format numbers for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  };

  const formatPercentage = (value) => {
    return `${Number(value || 0).toFixed(2)}%`;
  };

  // Load initial data
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="main-content p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Profit Report</h2>

      {/* Date Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-3xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={endDate}
              min={startDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 w-full max-w-3xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl mb-8">
          {[
            { key: 'productSales', label: 'Product Sales', icon: '💰', color: 'bg-green-50 text-green-600' },
            { key: 'voucherSales', label: 'Voucher Sales', icon: '🎫', color: 'bg-purple-50 text-purple-600' },
            { key: 'cost', label: 'Cost', icon: '📦', color: 'bg-yellow-50 text-yellow-600' },
            { key: 'profit', label: 'Profit', icon: '💵', color: summary.profit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600' },
          ].map((item) => (
            <div key={item.key} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <p className="text-lg font-semibold">
                    {item.key === 'profitPercentage' 
                      ? formatPercentage(summary[item.key])
                      : formatCurrency(summary[item.key])}
                    {item.key === 'profitPercentage' && (
                      <span className="text-xs ml-1">({formatPercentage(summary.profitPercentage)})</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-6xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            {salesData.length} records found
          </p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading sales data...</span>
            </div>
          </div>
        ) : salesData.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales data</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your date range</p>
            <div className="mt-6">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sale</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.map((sale, index) => (
                  <tr key={sale.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(sale.sale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(sale.discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(sale.cost)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      sale.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(sale.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercentage(sale.profitPercentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesProfit;