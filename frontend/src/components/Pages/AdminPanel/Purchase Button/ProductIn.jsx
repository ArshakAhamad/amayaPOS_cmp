import React, { useState, useEffect } from "react";
import Select from "react-select";

const ProductIn = () => {
  const [productDetails, setProductDetails] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [editingRows, setEditingRows] = useState({});

  // Fetch product details, suppliers, and products on component mount
  useEffect(() => {
    fetchProductDetails();
    fetchSuppliers();
    fetchProducts();
  }, []);

  // Fetch all products from the backend
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/products");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllProducts(
        data.products.map((p) => ({
          value: p.id,
          label: `${p.product_name} - ${p.price} LKR`,
          product: p,
        }))
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all products from the backend
  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5000/api/productin");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setProductDetails(
        data.products.map((p) => ({
          ...p,
          date: p.date || new Date().toISOString().split("T")[0],
          product_id: p.product_id || "",
          product: p.product || "",
          unitCost: p.unitCost || "",
          quantity: p.quantity || "",
          totalCost: p.totalCost || "",
          stock: p.stock || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all suppliers from the backend
  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/suppliers");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuppliers(data.suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError(error.message);
    }
  };

  // Handle product selection
  const handleProductSelect = (selectedOption, index) => {
    const updatedProductDetails = [...productDetails];
    if (selectedOption) {
      updatedProductDetails[index].product_id = selectedOption.value;
      updatedProductDetails[index].product =
        selectedOption.product.product_name;
      updatedProductDetails[index].unitCost =
        selectedOption.product.price || "";
    } else {
      updatedProductDetails[index].product_id = "";
      updatedProductDetails[index].product = "";
      updatedProductDetails[index].unitCost = "";
    }
    setProductDetails(updatedProductDetails);
  };

  // Handle input changes for other fields
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
        date: new Date().toISOString().split("T")[0],
        product_id: "",
        product: "",
        unitCost: "",
        quantity: "",
        totalCost: "",
        stock: "",
      },
    ]);
    // Automatically set new row to edit mode
    setEditingRows({ ...editingRows, [productDetails.length]: true });
  };

  // Remove a product row
  const handleRemoveProduct = async (index, productId) => {
    if (productDetails.length <= 1) {
      alert("You must have at least one product");
      return;
    }

    // If the product has an ID (already saved in database)
    if (productId) {
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/productin/${productId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        // Remove from local state after successful deletion
        const updatedProducts = [...productDetails];
        updatedProducts.splice(index, 1);
        setProductDetails(updatedProducts);

        // Remove from editing rows if it was being edited
        const newEditing = { ...editingRows };
        delete newEditing[index];
        setEditingRows(newEditing);
      } catch (error) {
        console.error("Error deleting product:", error);
        setError(error.message);
        alert(`Error deleting product: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new unsaved products, just remove from local state
      const updatedProducts = [...productDetails];
      updatedProducts.splice(index, 1);
      setProductDetails(updatedProducts);

      // Remove from editing rows if it was being edited
      const newEditing = { ...editingRows };
      delete newEditing[index];
      setEditingRows(newEditing);
    }
  };

  // Save all products to the backend
  const handleSave = async () => {
    const productsToSave = productDetails.filter(
      (p) =>
        p.product_id !== undefined &&
        p.product_id !== null &&
        p.product_id !== ""
    );

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
          products: productsToSave.map((p) => ({
            date: p.date || new Date().toISOString().split("T")[0],
            product_id: p.product_id,
            product: p.product.trim(),
            unitCost: parseFloat(p.unitCost) || 0,
            quantity: parseInt(p.quantity) || 0,
            totalCost: parseFloat(p.totalCost) || 0,
            stock: parseInt(p.stock) || 0,
          })),
          supplierId: selectedSupplier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      alert("Products saved successfully!");
      setEditingRows({}); // Exit all edit modes
      fetchProductDetails();
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
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplier_name}
                </option>
              ))}
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
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
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
                    {editingRows[index] || !product.id ? (
                      <Select
                        options={allProducts}
                        value={
                          product.product_id
                            ? allProducts.find(
                                (opt) => opt.value === product.product_id
                              )
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleProductSelect(selectedOption, index)
                        }
                        placeholder="Select Product"
                        isClearable
                        className="basic-single"
                        classNamePrefix="select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: "42px",
                            borderColor: "#d1d5db",
                            "&:hover": {
                              borderColor: "#d1d5db",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="p-2">{product.product}</span>
                      </div>
                    )}
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
                      onClick={() => handleRemoveProduct(index, product.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                    {/*    <button
                      onClick={() =>
                        setEditingRows({ ...editingRows, [index]: true })
                      }
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      Edit Product
                    </button> */}
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
                .reduce(
                  (acc, product) => acc + (parseFloat(product.totalCost) || 0),
                  0
                )
                .toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
              LKR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIn;
