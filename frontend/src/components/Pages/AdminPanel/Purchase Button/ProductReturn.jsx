import React, { useState } from "react";

const ProductReturn = () => {
  const [products, setProducts] = useState([
    {
      date: "2024-05-06",
      product: "HB-15",
      unitCost: 1590,
      quantity: 1,
      totalCost: 1590,
      avgCost: 1590,
      stock: 6,
    },
    {
      date: "2024-05-06",
      product: "HB-14",
      unitCost: 1590,
      quantity: 1,
      totalCost: 1590,
      avgCost: 1590,
      stock: 6,
    },
  ]);

  const handleInputChange = (e, index, field) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = e.target.value;
    updatedProducts[index].totalCost =
      updatedProducts[index].unitCost * updatedProducts[index].quantity;
    updatedProducts[index].avgCost = updatedProducts[index].totalCost;
    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        date: "",
        product: "",
        unitCost: "",
        quantity: "",
        totalCost: "",
        avgCost: "",
        stock: "",
      },
    ]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
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
            <select className="p-3 border border-gray-300 rounded-lg w-64">
              <option>Select Product</option>
              <option>Product 1</option>
              <option>Product 2</option>
              <option>Product 3</option>
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
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <input
                      type="date"
                      value={product.date}
                      onChange={(e) => handleInputChange(e, index, "date")}
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td className="px-6 py-3">{product.product}</td>
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
          <p className="text-xl font-semibold">Total : </p>
          <p className="text-xl font-semibold text-red-500">
            {products.reduce((acc, product) => acc + product.totalCost, 0).toLocaleString()} LKR
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductReturn;