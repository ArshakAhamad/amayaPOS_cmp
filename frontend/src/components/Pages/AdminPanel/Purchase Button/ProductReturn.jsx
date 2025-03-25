import React, { useState, useEffect } from "react";
import axios from 'axios';

const ProductReturn = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API base URL
  const API_BASE_URL = '/api/product-returns';

  // Fetch initial data
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_BASE_URL);
        setProducts(response.data?.returns || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching returns:', err);
        setError('Failed to load returns. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  // Search products
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/suggestions?query=${encodeURIComponent(searchQuery)}`
          );
          setSuggestions(response.data?.products || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Search error:', err);
          setSuggestions([]);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleInputChange = (e, index, field) => {
    const updatedProducts = [...products];
    const value = e.target.value;
    
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    
    if (field === 'unitCost' || field === 'quantity') {
      const unitCost = parseFloat(updatedProducts[index].unitCost) || 0;
      const quantity = parseFloat(updatedProducts[index].quantity) || 0;
      const totalCost = unitCost * quantity;
      
      updatedProducts[index].totalCost = totalCost.toFixed(2);
      updatedProducts[index].avgCost = totalCost.toFixed(2);
    }
    
    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        date: new Date().toISOString().split('T')[0],
        product: "",
        unitCost: "",
        quantity: 1,
        totalCost: "",
        avgCost: "",
        stock: ""
      }
    ]);
  };

  const handleRemoveProduct = async (index, id) => {
    if (id) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete return. Please try again.');
      }
    } else {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    }
  };

  const handleSelectProduct = (product, index) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product: product.name,
      unitCost: product.unitCost,
      avgCost: product.avgCost,
      stock: product.stock,
      quantity: 1,
      totalCost: (product.unitCost * 1).toFixed(2)
    };
    setProducts(updatedProducts);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      const invalidProducts = products.filter(p => 
        !p.product || 
        isNaN(parseFloat(p.unitCost)) || 
        isNaN(parseFloat(p.quantity))
      );

      if (invalidProducts.length > 0) {
        throw new Error('Please complete all product information');
      }

      const productsToSubmit = products.map(p => ({
        date: p.date,
        product: p.product,
        unitCost: parseFloat(p.unitCost),
        quantity: parseFloat(p.quantity),
        totalCost: parseFloat(p.totalCost || 0),
        avgCost: parseFloat(p.avgCost || 0),
        stock: parseFloat(p.stock || 0)
      }));

      const response = await axios.post(API_BASE_URL, { products: productsToSubmit });
      
      if (response.data.success) {
        // Refresh data
        const newResponse = await axios.get(API_BASE_URL);
        setProducts(newResponse.data?.returns || []);
        alert('Returns saved successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to save returns');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save returns');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

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
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search product (name or barcode)"
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSubmitting}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                {suggestions.map((product, idx) => (
                  <div
                    key={idx}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectProduct(product, products.length - 1)}
                  >
                    {product.name} (Stock: {product.stock || 0}, Price: {product.unitCost || 0})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-right">Unit Cost</th>
                <th className="px-6 py-3 text-center">Quantity</th>
                <th className="px-6 py-3 text-right">Total Cost</th>
                <th className="px-6 py-3 text-right">Avg Cost</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <input
                      type="date"
                      value={product.date}
                      onChange={(e) => handleInputChange(e, index, "date")}
                      className="w-full p-2 border rounded"
                      disabled={isSubmitting}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={product.product}
                      onChange={(e) => handleInputChange(e, index, "product")}
                      className="w-full p-2 border rounded"
                      disabled={isSubmitting}
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      value={product.unitCost}
                      onChange={(e) => handleInputChange(e, index, "unitCost")}
                      className="w-full p-2 border rounded text-right"
                      step="0.01"
                      min="0"
                      disabled={isSubmitting}
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleInputChange(e, index, "quantity")}
                      className="w-full p-2 border rounded text-center"
                      min="1"
                      disabled={isSubmitting}
                    />
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-red-500">
                    {product.totalCost || '0.00'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {product.avgCost || '0.00'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {product.stock || '0'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleRemoveProduct(index, product.id)}
                      className="text-red-600 hover:text-red-800 font-semibold disabled:text-gray-400"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            Add Product
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            disabled={isSubmitting || products.length === 0}
          >
            {isSubmitting ? 'Saving...' : 'Save Returns'}
          </button>
        </div>

        {/* Total Section */}
        <div className="flex justify-between items-center mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xl font-semibold">Total:</p>
          <p className="text-xl font-semibold text-red-500">
            {products
              .reduce((acc, product) => acc + (parseFloat(product.totalCost) || 0), 0)
              .toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} LKR
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductReturn;