/*import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../../../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const POSReturn = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isSalesRep, setIsSalesRep] = useState(false);
  const { cart, addToCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("/api/auth/check-role", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data.meta.success) {
          throw new( "Only Cashiers or authorized Sales Representatives can start the day. Please contact your administrator.");
        }

        setUserRole(response.data.data.role);
        setIsSalesRep(response.data.data.isSalesRep);
        
        // Admin users without SalesRep permissions will see a disabled interface
        if (response.data.data.role === "Admin" && !response.data.data.isSalesRep) {
          console.log("Admin without SalesRep permissions detected - access restricted");
        }
      } catch (err) {
        console.error("Permission check failed:", err);
        setError(err.message);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [navigate]);

  // Fetch products
  useEffect(() => {
    if (loading) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          throw new Error(response.data.message || "Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      }
    };

    fetchProducts();
  }, [loading]);

  // Check if user is authorized to process returns
  const isAuthorized = userRole === "Cashier" || (userRole === "Admin" && isSalesRep);

  const handleProductSelect = (event) => {
    if (!isAuthorized) return;
    
    const selectedValue = event.target.value;
    setSelectedProduct(selectedValue);

    const selected = products.find((product) => product.id === parseInt(selectedValue));
    setSelectedProductDetails(selected || null);
  };

  const handleAddToBill = () => {
    if (!isAuthorized) {
      alert("Only Cashiers or authorized Sales Representatives can process returns.");
      return;
    }

    if (!selectedProductDetails) {
      alert("Please select a product first.");
      return;
    }

    const existingItem = cart.find((item) => item.id === selectedProductDetails.id);
    
    if (existingItem) {
      updateQuantity(
        cart.indexOf(existingItem),
        existingItem.quantity + 1
      );
      return;
    }

    addToCart({
      id: selectedProductDetails.id,
      name: selectedProductDetails.product_name,
      price: selectedProductDetails.price,
      quantity: 1,
      status: "Pending Return",
    });
  };

  const handleQuantityChange = (index, value) => {
    if (!isAuthorized) return;
    updateQuantity(index, value);
  };

  const handleNewReturn = () => {
    if (!isAuthorized) {
      alert("Only Cashiers or authorized Sales Representatives can process returns.");
      return;
    }

    if (cart.length > 0 && !window.confirm("Current return items will be cleared. Continue?")) {
      return;
    }
    clearCart();
  };

  const totalAmount = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

  if (loading) {
    return <div className="main-content p-6">Loading permissions...</div>;
  }

  if (error) {
    return <div className="main-content p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {userRole === "Admin" && !isSalesRep && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            <p>Administrator Notice: You don't have permissions to process returns.</p>
            <p>Please switch to a Cashier account or contact system administration if you need access.</p>
          </div>
        )}

        /* Input Controls */
       /* <div className="barcode-select-container flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Scan Barcode (Alt+A)"
            className={`p-3 border border-gray-300 rounded-lg flex-grow sm:w-[250px] ${
              !isAuthorized ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            disabled={!isAuthorized}
          />
          <select
            className={`p-3 border border-gray-300 rounded-lg flex-grow sm:w-[250px] ${
              !isAuthorized ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            onChange={handleProductSelect}
            value={selectedProduct}
            disabled={!isAuthorized || products.length === 0}
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                00{product.id} - {product.product_name}
              </option>
            ))}
          </select>
          <button
            className={`px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
              !isAuthorized ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            onClick={handleAddToBill}
            disabled={!isAuthorized || !selectedProductDetails}
          >
            Add to Return
          </button>
        </div>

        /* Table Section */
     /*   <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[15%]">Date</th>
                <th className="px-4 py-3 text-left w-[25%]">Product</th>
                <th className="px-4 py-3 text-right w-[15%]">Unit Price (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Quantity</th>
                <th className="px-4 py-3 text-right w-[15%]">Total (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Stock</th>
                <th className="px-4 py-3 text-left w-[20%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? (
                cart.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-red-600 font-semibold">
                      {new Date().toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 text-right">{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        className={`w-20 p-2 text-center border rounded-md ${
                          !isAuthorized ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                        }`}
                        disabled={!isAuthorized}
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-red-500 text-right">
                      {(product.price * product.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">N/A</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{product.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 italic text-gray-500">
                    No return items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        /* Footer Controls *
        <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
          <button
            className={`px-6 py-3 rounded-md transition ${
              isAuthorized
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            onClick={handleNewReturn}
            disabled={!isAuthorized}
          >
            New Return
          </button>
          <div className="flex items-center gap-4 text-xl font-semibold">
            <span>Refund Total:</span>
            <span className="text-blue-600 font-bold">{totalAmount.toLocaleString()} LKR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSReturn;*/

import React from 'react'

const POSReturn = () => {
  return (
    <div>Only Cashiers or authorized Sales Representatives can start the day. Please contact your administrator.</div>
  )
}
export default POSReturn;