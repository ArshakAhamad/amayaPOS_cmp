import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductReturn = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsRes, returnsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/products"),
          axios.get("http://localhost:5000/api/product_returns")
        ]);

        setAllProducts(productsRes.data.products || []);
        
        // Initialize with sample data if no returns exist
        setProducts(returnsRes.data.returns?.length > 0 ? returnsRes.data.returns : [
          {
            date: new Date().toISOString().split('T')[0],
            product_id: "",
            product_name: "",
            unit_cost: 0,
            quantity: 1,
            total_cost: 0,
            avg_cost: 0,
            stock: 0,
            id: Date.now() // Temporary ID for new items
          }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e, index, field) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = e.target.value;
    
    // Calculate totals when unit cost or quantity changes
    if (field === "unit_cost" || field === "quantity") {
      updatedProducts[index].total_cost = 
        parseFloat(updatedProducts[index].unit_cost || 0) * 
        parseFloat(updatedProducts[index].quantity || 0);
      updatedProducts[index].avg_cost = updatedProducts[index].total_cost;
    }
    
    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        date: new Date().toISOString().split('T')[0],
        product_id: "",
        product_name: "",
        unit_cost: 0,
        quantity: 1,
        total_cost: 0,
        avg_cost: 0,
        stock: 0,
        id: Date.now() // Temporary ID for new items
      }
    ]);
  };

  const handleRemoveProduct = async (index) => {
    const productToRemove = products[index];
    
    // If the product has an ID (exists in database), delete from backend
    if (productToRemove.id && typeof productToRemove.id === 'number') {
      try {
        await axios.delete(`http://localhost:5000/api/product_returns/${productToRemove.id}`);
      } catch (err) {
        console.error("Error deleting product return:", err);
        alert("Failed to delete product return from server");
        return;
      }
    }
    
    // Remove from local state
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleProductSelect = (e, index) => {
    const productId = e.target.value;
    const selected = allProducts.find(p => p.id == productId);
    
    if (selected) {
      const updatedProducts = [...products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        product_id: selected.id,
        product_name: selected.product_name,
        unit_cost: selected.last_cost || 0,
        stock: selected.min_quantity || 0
      };
      
      // Recalculate totals
      updatedProducts[index].total_cost = 
        updatedProducts[index].unit_cost * updatedProducts[index].quantity;
      updatedProducts[index].avg_cost = updatedProducts[index].total_cost;
      
      setProducts(updatedProducts);
    }
  };

  const handleSubmit = async () => {
    try {
      // Filter out empty products
      const validProducts = products.filter(p => p.product_id);
      
      // Submit each product return
      await Promise.all(
        validProducts.map(product => {
          if (product.id && typeof product.id === 'number') {
            // Skip existing items (they're already in database)
            return Promise.resolve();
          }
          return axios.post("http://localhost:5000/api/product_returns", {
            date: product.date,
            product_id: product.product_id,
            unit_cost: product.unit_cost,
            quantity: product.quantity,
            total_cost: product.total_cost,
            avg_cost: product.avg_cost,
            stock: product.stock
          });
        })
      );
      
      alert("Product returns submitted successfully!");
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error submitting returns:", err);
      alert("Failed to submit product returns");
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
          <div className="text-red-500 text-center py-10">
            {error}
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        {/* 🔷 Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="barcode-select-container flex gap-4">
            <input
              type="text"
              placeholder="Alt + A (Barcode)"
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <select 
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select Product</option>
              {allProducts.map(product => (
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
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <input
                      type="date"
                      value={product.date}
                      onChange={(e) => handleInputChange(e, index, "date")}
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={product.product_id}
                      onChange={(e) => handleProductSelect(e, index)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Product</option>
                      {allProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.product_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      value={product.unit_cost}
                      onChange={(e) => handleInputChange(e, index, "unit_cost")}
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
                      value={product.total_cost}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100 text-right"
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      value={product.avg_cost}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔷 Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Product
          </button>
          
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Returns
          </button>
        </div>

        {/* 🔷 Total Section */}
        <div className="flex justify-between items-center mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xl font-semibold">Total : </p>
          <p className="text-xl font-semibold text-red-500">
            {products.reduce((acc, p) => acc + (parseFloat(p.total_cost) || 0), 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'LKR'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductReturn;