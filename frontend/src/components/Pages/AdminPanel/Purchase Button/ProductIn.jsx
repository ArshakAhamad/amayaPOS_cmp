import React, { useState } from "react";

const ProductIn = () => {
  const [productDetails, setProductDetails] = useState([
    {
      date: "2024-05-06",
      product: "HB-15",
      unitCost: 1590,
      quantity: 20,
      totalCost: 1590 * 20,
      stock: 6,
    },
    {
      date: "2024-05-06",
      product: "HB-14",
      unitCost: 1590,
      quantity: 20,
      totalCost: 1590 * 20,
      stock: 6,
    },
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState(""); // ✅ Fixed state declaration

  const handleInputChange = (e, index, field) => {
    const updatedProductDetails = [...productDetails];
    updatedProductDetails[index][field] = e.target.value;
    updatedProductDetails[index].totalCost =
      updatedProductDetails[index].unitCost * updatedProductDetails[index].quantity;
    setProductDetails(updatedProductDetails);
  };

  const handleAddProduct = () => {
    setProductDetails([
      ...productDetails,
      {
        date: "",
        product: "",
        unitCost: "",
        quantity: "",
        totalCost: "",
        stock: "",
      },
    ]);
  };

  const handleSave = () => {
    console.log("Saved", productDetails);
    // Implement save logic here
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
              className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
              onChange={(e) => setSelectedSupplier(e.target.value)}
              value={selectedSupplier}
            >
              <option value="">Select Supplier</option>
              <option value="supplier1">Supplier 1</option>
              <option value="supplier2">Supplier 2</option>
            </select>
          </div>
          <div className="barcode-select-container">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              Complete GRN
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Bill & Supplier
            </button>
          </div>
        </div>

        {/* 🔷 Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[15%]">Date</th>
                <th className="px-4 py-3 text-left w-[25%]">Product</th>
                <th className="px-4 py-3 text-right w-[15%]">Unit Cost (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Quantity</th>
                <th className="px-4 py-3 text-right w-[15%]">Total Cost (LKR)</th>
                <th className="px-4 py-3 text-center w-[10%]">Stock</th>
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
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.product}
                      onChange={(e) => handleInputChange(e, index, "product")}
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={product.unitCost}
                      onChange={(e) => handleInputChange(e, index, "unitCost")}
                      className="w-full p-2 border rounded text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleInputChange(e, index, "quantity")}
                      className="w-full p-2 border rounded text-center"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">
                    <input
                      type="number"
                      value={product.totalCost}
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
                    />
                  </td>
                </tr>
              ))}
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
          <p className="text-xl font-semibold">Total</p>
          <p className="text-xl font-semibold text-red-500">
            {productDetails.reduce((acc, product) => acc + product.totalCost, 0).toLocaleString()} LKR
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductIn;
