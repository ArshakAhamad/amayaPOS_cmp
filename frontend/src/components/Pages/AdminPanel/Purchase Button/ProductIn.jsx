import React, { useState, useEffect } from "react";

const ProductIn = () => {
  const [productDetails, setProductDetails] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product details from the backend on component mount
  useEffect(() => {
    fetchProductDetails();
  }, []);

  // Fetch all products from the backend
  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5000/api/productin");
      
      // First check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProductDetails(data.products.map(p => ({
        ...p,
        date: p.date || new Date().toISOString().split('T')[0],
        unitCost: p.unitCost || "",
        quantity: p.quantity || "",
        totalCost: p.totalCost || "",
        stock: p.stock || ""
      })));
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for product fields
  const handleInputChange = (e, index, field) => {
    const updatedProductDetails = [...productDetails];
    const value = e.target.value;
    
    updatedProductDetails[index][field] = value;

    // Recalculate totalCost if unitCost or quantity changes
    if (field === "unitCost" || field === "quantity") {
      const unitCost = parseFloat(updatedProductDetails[index].unitCost) || 0;
      const quantity = parseInt(updatedProductDetails[index].quantity) || 0;
      updatedProductDetails[index].totalCost = unitCost * quantity;
    }

    setProductDetails(updatedProductDetails);
  };

  // Add a new empty product row
  const handleAddProduct = () => {
    setProductDetails([
      ...productDetails,
      {
        date: new Date().toISOString().split('T')[0],
        product: "",
        unitCost: "",
        quantity: "",
        totalCost: "",
        stock: "",
      },
    ]);
  };

  // Remove a product row
  const handleRemoveProduct = (index) => {
    if (productDetails.length <= 1) {
      alert("You must have at least one product");
      return;
    }
    const updatedProducts = [...productDetails];
    updatedProducts.splice(index, 1);
    setProductDetails(updatedProducts);
  };

  // Save all products to the backend
  const handleSave = async () => {
    // Filter out empty rows (where product is not specified)
    const productsToSave = productDetails.filter(p => p.product && p.product.trim() !== "");

    if (productsToSave.length === 0) {
      alert("Please add at least one product before saving");
      return;
    }

    if (!selectedSupplier) {
      alert("Please select a supplier before saving");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5000/api/productin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          products: productsToSave.map(p => ({
            date: p.date || new Date().toISOString().split('T')[0],
            product: p.product.trim(),
            unitCost: parseFloat(p.unitCost) || 0,
            quantity: parseInt(p.quantity) || 0,
            totalCost: parseFloat(p.totalCost) || 0,
            stock: parseInt(p.stock) || 0
          })),
          supplier: selectedSupplier
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert("Products saved successfully!");
      fetchProductDetails(); // Refresh the list
    } catch (error) {
      console.error("Error saving products:", error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="main-content p-6 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Alt + A (Barcode)"
              className="p-3 border border-gray-300 rounded-lg w-64"
            />
            <select
              className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
              onChange={(e) => setSelectedSupplier(e.target.value)}
              value={selectedSupplier}
              required
            >
              <option value="">Select Supplier</option>
              <option value="supplier1">Supplier 1</option>
              <option value="supplier2">Supplier 2</option>
            </select>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              onClick={handleSave}
              disabled={isLoading}
            >
              Complete GRN
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              disabled={isLoading}
            >
              Save Bill & Supplier
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-right">Unit Cost (LKR)</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Total Cost (LKR)</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {productDetails.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={product.date}
                      onChange={(e) => handleInputChange(e, index, "date")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.product}
                      onChange={(e) => handleInputChange(e, index, "product")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
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
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleInputChange(e, index, "quantity")}
                      className="w-full p-2 border rounded text-center"
                      min="0"
                      required
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">
                    <input
                      type="number"
                      value={product.totalCost || ""}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100 text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => handleInputChange(e, index, "stock")}
                      className="w-full p-2 border rounded text-center"
                      min="0"
                      required
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Product
          </button>
          
          <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg min-w-[300px]">
            <p className="text-xl font-semibold">Total</p>
            <p className="text-xl font-semibold text-red-500">
              {productDetails
                .reduce((acc, product) => acc + (parseFloat(product.totalCost) || 0), 0)
                .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIn;