import { useEffect, useState } from "react";
import axios from "axios";

const ProductReturn = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductReturns = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/product_returns");
        
        if (response.data?.success) {
          setReturns(response.data.returns);
        } else {
          throw new Error(response.data?.error || "Invalid response format");
        }
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductReturns();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
        <p className="text-red-600 font-medium">Error loading product returns</p>
        <p className="text-red-500 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Product Returns</h2>
      
      {returns.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product_name || `Product ID: ${item.product_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unit_cost?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'LKR'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                    {item.total_cost?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'LKR'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
          <p className="text-yellow-800">No product returns found</p>
        </div>
      )}
    </div>
  );
};

export default ProductReturn;