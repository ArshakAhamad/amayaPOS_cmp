import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true
});

const ProductReturn = () => {
  const [products, setProducts] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [returnReason, setReturnReason] = useState("Damaged Product");
  const [returnHistory, setReturnHistory] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(null);

  // Fetch product suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        api.get(`/returns/suggestions?query=${searchQuery}`)
          .then(res => setProductSuggestions(res.data.products))
          .catch(err => console.error("Fetch suggestions error:", err));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProductSuggestions([]);
    }
  }, [searchQuery]);

  // Fetch existing returns history
  const fetchReturnHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const res = await api.get("/returns");
      if (res.data.success) {
        setReturnHistory(res.data.returns);
      }
    } catch (err) {
      console.error("Error fetching return history:", err);
      setError("Failed to load return history");
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchReturnHistory();
  }, []);

  const handleInputChange = (e, index, field) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = e.target.value;
    
    if (field === "unitCost" || field === "quantity") {
      const unitCost = parseFloat(updatedProducts[index].unitCost) || 0;
      const quantity = parseInt(updatedProducts[index].quantity) || 0;
      updatedProducts[index].totalCost = unitCost * quantity;
    }
    
    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    const newProduct = {
      date: new Date().toISOString().split('T')[0],
      product: "",
      product_id: null,
      unitCost: "",
      quantity: 0,
      totalCost: 0,
      stock: 0,
      avgCost: 0
    };
    
    setProducts([...products, newProduct]);
    setActiveProductIndex(products.length);
    setSearchQuery("");
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    setActiveProductIndex(null);
  };

  const handleProductSelect = (selectedProduct) => {
    if (activeProductIndex === null) return;
    
    const updatedProducts = [...products];
    updatedProducts[activeProductIndex] = {
      ...updatedProducts[activeProductIndex],
      product: selectedProduct.name,
      product_id: selectedProduct.id,
      unitCost: selectedProduct.unitCost || selectedProduct.last_cost || 0,
      quantity: 1,
      stock: selectedProduct.stock || 0,
      avgCost: selectedProduct.avgCost || 0,
      totalCost: (selectedProduct.unitCost || selectedProduct.last_cost || 0) * 1
    };
    
    setProducts(updatedProducts);
    setSearchQuery("");
    setProductSuggestions([]);
    setActiveProductIndex(null);
  };

  const handleProductNameFocus = (index) => {
    setActiveProductIndex(index);
    setSearchQuery(products[index].product);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (products.length === 0) {
      setError("Please add at least one product");
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const productsToSend = products.map((product, index) => {
        if (!product.date || !product.product || !product.unitCost || !product.quantity) {
          throw new Error(`Product ${index + 1} has missing fields`);
        }
  
        const unitCost = parseFloat(product.unitCost);
        const quantity = parseInt(product.quantity);
  
        if (isNaN(unitCost)) throw new Error(`Invalid unit cost for product ${index + 1}`);
        if (isNaN(quantity)) throw new Error(`Invalid quantity for product ${index + 1}`);
  
        return {
          date: product.date,
          product_id: product.product_id,
          product: product.product.trim(),
          unit_cost: unitCost,
          quantity: quantity,
          return_reason: returnReason,
          stock: product.stock,
          avg_cost: product.avgCost
        };
      });
  
      const response = await api.post("/returns", { 
        products: productsToSend 
      });
  
      if (response.data.success) {
        alert("Returns processed successfully!");
        setProducts([]);
        await fetchReturnHistory();
      } else {
        throw new Error(response.data.message || "Server returned unsuccessful response");
      }
    } catch (error) {
      console.error('Submission Error:', error);
      
      let errorMessage = "Failed to process returns";
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      JSON.stringify(error.response.data);
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }
  
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content p-6">
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 mb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search or type product name..."
                className="p-3 border border-gray-300 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {productSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {productSuggestions.map((product) => (
                    <div 
                      key={product.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.name} (Stock: {product.stock}, Cost: {product.unitCost || product.last_cost})
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <select
              className="p-3 border rounded-lg"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            >
              <option value="Damaged Product">Damaged Product</option>
              <option value="Wrong Item Shipped">Wrong Item Shipped</option>
              <option value="Item No Longer Needed">Item No Longer Needed</option>
              <option value="Defective Product">Defective Product</option>
              <option value="Wrong Size">Wrong Size</option>
              <option value="Better Price Available">Better Price Available</option>
            </select>

            <button
              type="button"
              onClick={handleAddProduct}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
            >
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-right">Unit Cost</th>
                  <th className="px-6 py-3 text-center">Quantity</th>
                  <th className="px-6 py-3 text-right">Total Cost</th>
                  <th className="px-6 py-3 text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No products added
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <input
                          type="date"
                          value={product.date}
                          onChange={(e) => handleInputChange(e, index, "date")}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={product.product}
                          onChange={(e) => handleInputChange(e, index, "product")}
                          onFocus={() => handleProductNameFocus(index)}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <input
                          type="number"
                          value={product.unitCost}
                          onChange={(e) => handleInputChange(e, index, "unitCost")}
                          className="w-full p-2 border rounded text-right"
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleInputChange(e, index, "quantity")}
                          className="w-full p-2 border rounded text-center"
                          min="1"
                          required
                        />
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-500">
                        {product.totalCost.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Total Products:</span>
              <span className="font-bold">{products.length}</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || products.length === 0}
              className={`px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                (isLoading || products.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Processing...
                </>
              ) : 'Submit Returns'}
            </button>
          </div>

          {products.length > 0 && (
            <div className="flex justify-between items-center mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-xl font-semibold">Total Amount: </p>
              <p className="text-xl font-semibold text-red-500">
                {products
                  .reduce((acc, p) => acc + (parseFloat(p.totalCost) || 0), 0)
                  .toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Return History Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Return History</h2>
        {isFetchingHistory ? (
          <div className="flex justify-center items-center p-8">
            <span className="inline-block animate-spin mr-2">↻</span>
            Loading history...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-right">Unit Cost</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {returnHistory.length > 0 ? (
                  returnHistory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{item.date}</td>
                      <td className="px-6 py-3">{item.product}</td>
                      <td className="px-6 py-3 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-right">
                        {item.unitCost.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold">
                        {item.totalCost.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-3">{item.return_reason}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No return history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReturn;