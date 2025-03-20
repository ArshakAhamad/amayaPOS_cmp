import React, { useState, useEffect } from "react";

const POSReturn = () => {
  const [products, setProducts] = useState([]); // State to store fetched products
  const [selectedProduct, setSelectedProduct] = useState(""); // State to store selected product ID
  const [cart, setCart] = useState([]); // State to store selected products for return

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products"); // Replace with your API endpoint
        const data = await response.json();
        if (data.success) {
          setProducts(data.products); // Populate the products state
          console.log("Fetched Products:", data.products); // Debugging: Log fetched products
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // Handle product selection
  const handleProductSelect = (event) => {
    const selectedValue = event.target.value; // This will be the product ID
    setSelectedProduct(selectedValue);

    // Find the selected product in the products array
    const selectedProduct = products.find((product) => product.id === parseInt(selectedValue));

    if (selectedProduct) {
      // Check if the product is already in the cart
      const isProductInCart = cart.some((product) => product.id === selectedProduct.id);

      if (!isProductInCart) {
        // Add the selected product to the cart
        const newProduct = {
          id: selectedProduct.id,
          name: selectedProduct.product_name,
          price: selectedProduct.price,
          quantity: 1,
          status: "Pending Return",
        };

        // Debugging: Check if the product is added to the cart
        console.log("New Product Added to Cart:", newProduct);

        setCart((prevCart) => [...prevCart, newProduct]);
      } else {
        alert("Product is already in the cart.");
      }
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    setCart((prevCart) =>
      prevCart.map((product, i) =>
        i === index ? { ...product, quantity: Math.max(1, value) } : product
      )
    );
  };

  // Calculate total amount
  const totalAmount = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* 🔷 Input Controls */}
        <div className="barcode-select-container">
          <input
            type="text"
            placeholder="Alt + A (Barcode)"
            className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
          />
          <select
            className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
            onChange={handleProductSelect}
            value={selectedProduct}
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                00{product.id}
              </option>
            ))}
          </select>
        </div>

        {/* 🔷 Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[15%]">Date</th>
                <th className="px-4 py-3 text-left w-[25%]">Product</th>
                <th className="px-4 py-3 text-right w-[15%]">Unit Price (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Quantity</th>
                <th className="px-4 py-3 text-right w-[15%]">Total (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Stock</th>
                <th className="px-4 py-3 text-left w-[20%]">Settle</th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? (
                cart.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-red-600 font-semibold">{new Date().toISOString().split("T")[0]}</td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 text-right">{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        className="w-20 p-2 text-center border rounded-md bg-white text-black"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-red-500 text-right">{(product.price * product.quantity).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">N/A</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{product.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 italic text-gray-500">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔷 Footer Controls */}
        <div className="flex justify-between items-center mt-6">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            New
          </button>
          <div className="flex items-center gap-4 text-xl font-semibold">
            <span>Total:</span>
            <span className="text-blue-600 font-bold">{totalAmount.toLocaleString()} LKR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSReturn;