import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../../../../contexts/CartContext";
import axios from "axios";

const CashierPOSReturn = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { cart, addToCart, updateQuantity, clearCart } = useContext(CartContext);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/products");
        
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          throw new Error(response.data.message || "Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (event) => {
    const selectedValue = event.target.value;
    setSelectedProduct(selectedValue);

    const selected = products.find((product) => product.id === parseInt(selectedValue));
    setSelectedProductDetails(selected || null);
  };

  const handleAddToBill = () => {
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
    const newValue = Math.max(1, value);
    updateQuantity(index, isNaN(newValue) ? 1 : newValue);
  };

  const handleNewReturn = () => {
    if (cart.length > 0 && !window.confirm("Current return items will be cleared. Continue?")) {
      return;
    }
    clearCart();
  };

  const totalAmount = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

  if (loading) {
    return <div className="main-content p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="main-content p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Input Controls */}
        <div className="barcode-select-container flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Scan Barcode (Alt+A)"
            className="p-3 border border-gray-300 rounded-lg flex-grow sm:w-[250px]"
          />
          <select
            className="p-3 border border-gray-300 rounded-lg flex-grow sm:w-[250px]"
            onChange={handleProductSelect}
            value={selectedProduct}
            disabled={products.length === 0}
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                00{product.id} - {product.product_name}
              </option>
            ))}
          </select>
          <button
            className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={handleAddToBill}
            disabled={!selectedProductDetails}
          >
            Add to Return
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto mb-6">
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
                        className="w-20 p-2 text-center border rounded-md bg-white"
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

        {/* Footer Controls */}
        <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={handleNewReturn}
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

export default CashierPOSReturn;