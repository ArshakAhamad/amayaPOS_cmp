import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductReturn = () => {
  // Initialize products as an empty array to avoid issues with undefined
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    date: "",
    product: "",
    productName: "",  // Added product name field
    unitCost: "",
    quantity: "",
    totalCost: "",
    avgCost: "",
    stock: "",
  });

  // Fetch products from the backend when the component is mounted
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products"); // Adjust this endpoint to match your API
        if (Array.isArray(response.data)) {
          setProducts(response.data); // Assuming response.data is an array of products
        } else {
          console.error("Products data is not an array:", response.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // Handle changes for the new product form
  const handleNewProductChange = (e, field) => {
    const { value } = e.target;
    setNewProduct((prev) => {
      if (field === "product") {
        // Find the product name based on the selected product ID
        const selectedProduct = products.find((product) => product.id === value);
        return {
          ...prev,
          [field]: value,
          productName: selectedProduct ? selectedProduct.product_name : "",  // Update the product name
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Handle adding a new product return
  const handleAddProduct = async () => {
    try {
      const response = await axios.post("/api/product-returns", newProduct);
      if (response.data.success) {
        setProducts([...products, newProduct]);
        setNewProduct({
          date: "",
          product: "",
          productName: "",  // Reset the product name
          unitCost: "",
          quantity: "",
          totalCost: "",
          avgCost: "",
          stock: "",
        });
      }
    } catch (err) {
      console.error("Error adding product return:", err);
    }
  };

  // Handle removing a product return
  const handleRemoveProduct = async (index) => {
    try {
      const productId = products[index].id;
      const response = await axios.delete(`/api/product-returns/${productId}`);
      if (response.data.success) {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
      }
    } catch (err) {
      console.error("Error removing product return:", err);
    }
  };

  // Handle updating a product return
  const handleUpdateProduct = async (index) => {
    const updatedProduct = products[index];
    try {
      const response = await axios.put(`/api/product-returns/${updatedProduct.id}`, updatedProduct);
      if (response.data.success) {
        setProducts(
          products.map((product, i) =>
            i === index ? response.data.data : product
          )
        );
      }
    } catch (err) {
      console.error("Error updating product return:", err);
    }
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* 🔷 Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="barcode-select-container">
            <input
              type="text"
              placeholder="Alt + A (Barcode)"
              className="p-3 border border-gray-300 rounded-lg w-64"
            />
            <select
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={newProduct.product}
              onChange={(e) => handleNewProductChange(e, "product")}
            >
              <option value="">Select Product</option>
              {Array.isArray(products) && products.length > 0 &&
                products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 🔷 Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left w-[12%]">Date</th>
                <th className="px-6 py-3 text-left w-[20%]">Product</th>
                <th className="px-6 py-3 text-right w-[12%]">Unit Cost (LKR)</th>
                <th className="px-6 py-3 text-center w-[10%]">Quantity</th>
                <th className="px-6 py-3 text-right w-[12%]">Total Cost (LKR)</th>
                <th className="px-6 py-3 text-right w-[12%]">Avg Cost (LKR)</th>
                <th className="px-6 py-3 text-center w-[10%]">Stock</th>
                <th className="px-6 py-3 text-center w-[12%]">Remove</th>
                <th className="px-6 py-3 text-center w-[12%]">Update</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <input
                        type="date"
                        value={product.date}
                        onChange={(e) => handleInputChange(e, index, "date")}
                        className="w-full p-2 border rounded"
                      />
                    </td>
                    <td className="px-6 py-3">{product.product_name}</td>
                    <td className="px-6 py-3 text-right">
                      <input
                        type="number"
                        value={product.unitCost}
                        onChange={(e) => handleInputChange(e, index, "unitCost")}
                        className="w-full p-2 border rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleInputChange(e, index, "quantity")}
                        className="w-full p-2 border rounded text-center"
                      />
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-red-500">
                      <input
                        type="number"
                        value={product.totalCost}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100 text-right"
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <input
                        type="number"
                        value={product.avgCost}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100 text-right"
                      />
                    </td>
                    <td className="px-6 py-3 text-center">{product.stock}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleUpdateProduct(index)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-3 text-center">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔷 Add New Product Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Product
          </button>
        </div>

        {/* 🔷 Total Section */}
        <div className="flex justify-between items-center mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xl font-semibold">Total : </p>
          <p className="text-xl font-semibold text-red-500">
            {products
              .reduce((acc, product) => acc + parseFloat(product.totalCost || 0), 0)
              .toLocaleString()}{" "}
            LKR
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductReturn;
