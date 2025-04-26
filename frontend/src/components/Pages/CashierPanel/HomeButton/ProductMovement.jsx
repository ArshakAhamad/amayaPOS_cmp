import React, { useState, useEffect } from "react";

const ProductMovement = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedProduct, setSelectedProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [productMovementData, setProductMovementData] = useState([]);
  const [salesData, setSalesData] = useState({
    productSales: 0.0,
    voucherSales: 0.0,
    costDiscounts: 0.0,
    expenses: 0.0,
    profitLoss: 0.0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/productMovement/products"
        );
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to connect to server");
      }
    };
    fetchProducts();
  }, []);

  const handleProductSelect = (e) => {
    setSelectedProduct(e.target.value);
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/productMovement?startDate=${startDate}&endDate=${endDate}`;
      if (selectedProduct) {
        url += `&productId=${selectedProduct}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Process and validate all numeric fields
        const processedData = data.movements.map((item) => ({
          ...item,
          date: item.date || "",
          type: item.type || "",
          reference: item.reference || "",
          product: item.product || "",
          price: Number(item.price) || 0,
          cost: Number(item.cost) || 0,
          productIn: Number(item.productIn) || 0,
          productOut: Number(item.productOut) || 0,
          returnId: item.returnId || "",
          inventory: Number(item.inventory) || 0,
        }));

        setProductMovementData(processedData);
        setSalesData({
          productSales: Number(data.summary?.productSales) || 0,
          voucherSales: 0, // Not currently calculated
          costDiscounts: Number(data.summary?.costDiscounts) || 0,
          expenses: 0, // Not currently calculated
          profitLoss: Number(data.summary?.profitLoss) || 0,
        });
      } else {
        setError(data.message || "No data available for the selected filters");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="main-content p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
          <div className="text-red-500 p-4 border border-red-200 bg-red-50 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Date Pickers & Generate Button */}
        <div className="sales-controls flex flex-wrap gap-4 items-center justify-between mb-6">
          <label
            htmlFor="startDate"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            className="date-picker p-3 border rounded-lg text-sm w-full sm:w-auto"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label
            htmlFor="endDate"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            className="date-picker p-3 border rounded-lg text-sm w-full sm:w-auto"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <select
            className="date-picker p-3 border rounded-lg text-sm w-full sm:w-auto"
            onChange={handleProductSelect}
            value={selectedProduct}
            disabled={loading}
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product_name}
              </option>
            ))}
          </select>

          <button
            className="generate-btn p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-blue-300"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {/* Report Summary Cards */}
        <div className="sales-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="summary-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between">
            <span className="icon text-xl">🔖</span>
            <div>
              <p className="text-sm">Price</p>
              <h3 className="text-lg">{salesData.productSales.toFixed(2)}</h3>
            </div>
          </div>
          <div className="summary-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between">
            <span className="icon text-xl">💰</span>
            <div>
              <p className="text-sm">Discounts</p>
              <h3 className="text-lg">{salesData.voucherSales.toFixed(2)}</h3>
            </div>
          </div>
          <div className="summary-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between">
            <span className="icon text-xl">📦</span>
            <div>
              <p className="text-sm">Cost</p>
              <h3 className="text-lg">{salesData.costDiscounts.toFixed(2)}</h3>
            </div>
          </div>
          <div className="summary-card profit-card p-6 bg-white rounded-lg shadow-md flex items-center justify-between border-2 border-red-400">
            <span className="icon text-xl">⚡</span>
            <div>
              <p className="text-sm">Profit [0.00%]</p>
              <h3 className="profit-amount text-red-600 text-lg">
                {salesData.profitLoss.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Product Movement Table */}
        <div className="sales-table bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Product Movement</h3>
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Cost</th>
                <th className="px-4 py-3 text-left">Product In</th>
                <th className="px-4 py-3 text-left">Product Out</th>
                <th className="px-4 py-3 text-left">Return ID</th>
                <th className="px-4 py-3 text-left">Inventory</th>
              </tr>
            </thead>
            <tbody>
              {productMovementData.length > 0 ? (
                productMovementData.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">{row.type}</td>
                    <td className="px-4 py-2">{row.reference}</td>
                    <td className="px-4 py-2">{row.product}</td>
                    <td className="px-4 py-2">{row.price.toFixed(2)}</td>
                    <td className="px-4 py-2">{row.cost.toFixed(2)}</td>
                    <td className="px-4 py-2">{row.productIn}</td>
                    <td className="px-4 py-2">{row.productOut}</td>
                    <td className="px-4 py-2">{row.returnId || "-"}</td>
                    <td className="px-4 py-2">{row.inventory}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-4 italic text-gray-500"
                  >
                    {loading ? "Loading data..." : "No Sales Data Available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductMovement;
