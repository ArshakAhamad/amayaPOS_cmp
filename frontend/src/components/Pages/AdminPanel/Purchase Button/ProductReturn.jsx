import React, { useState, useEffect } from "react";
import axios from "axios";
import Popup from "reactjs-popup";
import { Icon } from "@iconify/react";
import eyeOff from "@iconify/icons-mdi/eye-off";
import eye from "@iconify/icons-mdi/eye";

const ProductReturn = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [passwordIcon, setPasswordIcon] = useState(eyeOff);
  const [approvalPassword, setApprovalPassword] = useState("");
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsRes, returnsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/products"),
          axios.get("http://localhost:5000/api/product_returns"),
        ]);

        setAllProducts(productsRes.data.products || []);

        setProducts(
          returnsRes.data.returns?.length > 0
            ? returnsRes.data.returns
            : [
                {
                  date: new Date().toISOString().split("T")[0],
                  product_id: "",
                  product_name: "",
                  unit_cost: 0,
                  quantity: 1,
                  total_cost: 0,
                  avg_cost: 0,
                  stock: 0,
                  id: Date.now(),
                },
              ]
        );

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
    const value = e.target.value;

    if (
      field === "product_id" &&
      products.some(
        (p) => p.product_id === value && p.id !== updatedProducts[index].id
      )
    ) {
      alert("This product is already added!");
      return;
    }

    updatedProducts[index][field] = value;

    if (field === "unit_cost" || field === "quantity") {
      updatedProducts[index].total_cost =
        parseFloat(updatedProducts[index].unit_cost || 0) *
        parseFloat(updatedProducts[index].quantity || 0);
      updatedProducts[index].avg_cost = updatedProducts[index].total_cost;
    }

    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    // Only allow adding if the last product is not empty
    if (products.length > 0 && !products[products.length - 1].product_id) {
      alert("Please fill the current product before adding a new one");
      return;
    }

    setProducts([
      ...products,
      {
        date: new Date().toISOString().split("T")[0],
        product_id: "",
        product_name: "",
        unit_cost: 0,
        quantity: 1,
        total_cost: 0,
        avg_cost: 0,
        stock: 0,
        id: Date.now(),
      },
    ]);
  };

  const handleRemoveProduct = async (index) => {
    const productToRemove = products[index];

    if (
      !window.confirm("Are you sure you want to remove this product return?")
    ) {
      return;
    }

    try {
      if (productToRemove.id && typeof productToRemove.id === "number") {
        await axios.delete(
          `http://localhost:5000/api/product_returns/${productToRemove.id}`
        );
      }

      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(
        updatedProducts.length > 0
          ? updatedProducts
          : [
              {
                date: new Date().toISOString().split("T")[0],
                product_id: "",
                product_name: "",
                unit_cost: 0,
                quantity: 1,
                total_cost: 0,
                avg_cost: 0,
                stock: 0,
                id: Date.now(),
              },
            ]
      );
    } catch (err) {
      console.error("Error deleting product return:", err);
      alert(
        `Failed to delete product return: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleProductSelect = (e, index) => {
    const productId = e.target.value;

    // Check if product already exists in the list
    if (products.some((p, i) => i !== index && p.product_id === productId)) {
      alert("This product is already added!");
      return;
    }

    const selected = allProducts.find((p) => p.id == productId);

    if (selected) {
      const updatedProducts = [...products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        product_id: selected.id,
        product_name: selected.product_name,
        unit_cost: selected.last_cost || 0,
        stock: selected.min_quantity || 0,
      };

      updatedProducts[index].total_cost =
        updatedProducts[index].unit_cost * updatedProducts[index].quantity;
      updatedProducts[index].avg_cost = updatedProducts[index].total_cost;

      setProducts(updatedProducts);
    }
  };

  const handleSubmit = async (closePopup) => {
    try {
      const validProducts = products.filter((p) => p.product_id);

      if (validProducts.length === 0) {
        alert("No valid products to submit");
        return;
      }

      // First validate the password
      const passwordResponse = await axios.post(
        "http://localhost:5000/api/validate-password",
        { password: approvalPassword }
      );

      if (!passwordResponse.data.valid) {
        alert("Invalid manager password");
        return;
      }

      const returns = validProducts.map((product) => ({
        date: product.date,
        product_id: product.product_id,
        unitCost: product.unit_cost,
        quantity: product.quantity,
        totalCost: product.total_cost,
        avgCost: product.avg_cost,
        stock: product.stock,
      }));

      const response = await axios.post(
        "http://localhost:5000/api/product_returns",
        { returns }
      );

      if (response.data.success) {
        alert("Product returns submitted successfully!");
        const returnsRes = await axios.get(
          "http://localhost:5000/api/product_returns"
        );
        setProducts(returnsRes.data.returns || []);
        setApprovalPassword("");
        if (closePopup) closePopup();
      }
    } catch (err) {
      console.error("Error submitting returns:", err);
      alert(`Failed to submit product returns: ${err.message}`);
      if (closePopup) closePopup();
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
    setPasswordIcon(passwordIcon === eyeOff ? eye : eyeOff);
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
              placeholder="Scan Barcode.."
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            {/*     <select
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select Product</option>
              {allProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name}
                </option>
              ))}
            </select> */}
          </div>
        </div>

        {/* 🔷 Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left w-[12%]">Date</th>
                <th className="px-6 py-3 text-left w-[20%]">Product</th>
                <th className="px-6 py-3 text-right w-[12%]">
                  Unit Cost (LKR)
                </th>
                <th className="px-6 py-3 text-center w-[10%]">Quantity</th>
                <th className="px-6 py-3 text-right w-[12%]">
                  Total Cost (LKR)
                </th>
                <th className="px-6 py-3 text-right w-[12%]">Avg Cost (LKR)</th>
                <th className="px-6 py-3 text-center w-[10%]">Stock</th>
                <th className="px-6 py-3 text-center w-[12%]">
                  Remove Product
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id || index}
                  className="border-b hover:bg-gray-50 transition"
                >
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
                      <option value="">Search Product</option>
                      {allProducts.map((p) => (
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
                      Delete Item
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

          <Popup
            trigger={
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Submit Returns
              </button>
            }
            modal
            onClose={() => {
              setPasswordType("password");
              setPasswordIcon(eyeOff);
              setApprovalPassword("");
            }}
          >
            {(close) => (
              <div className="w-full p-4 bg-gray-900 text-white rounded-lg">
                <h3 className="text-xl font-bold mb-4">
                  Confirm Product Returns
                </h3>
                <p className="mb-4">
                  Total Amount:{" "}
                  {products
                    .reduce(
                      (acc, p) => acc + (parseFloat(p.total_cost) || 0),
                      0
                    )
                    .toLocaleString("en-US", {
                      style: "currency",
                      currency: "LKR",
                    })}
                </p>

                <div className="form-field mb-4">
                  <label className="block mb-2">Manager Password:</label>
                  <div className="relative">
                    <input
                      type={passwordType}
                      value={approvalPassword}
                      onChange={(e) => setApprovalPassword(e.target.value)}
                      className="w-full p-2 pl-3 pr-10 border rounded bg-gray-800 text-white placeholder-gray-400"
                      placeholder="Enter password"
                    />
                    <span
                      className="absolute right-3 top-2.5 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      <Icon icon={passwordIcon} size={20} />
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={close}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit(close)}
                    className={`px-4 py-2 rounded text-white transition-colors ${
                      approvalPassword
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-400 cursor-not-allowed"
                    }`}
                    disabled={!approvalPassword}
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}
          </Popup>
        </div>

        {/* 🔷 Total Section */}
        <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xl font-semibold">Total:</p>
          <p className="text-xl font-semibold text-red-500 text-right">
            {products
              .reduce((acc, p) => acc + (parseFloat(p.total_cost) || 0), 0)
              .toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
              })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductReturn;
