import React, { useState } from 'react';
import Switch from 'react-switch';
import axios from 'axios'; // Added import for axios

const CreateProducts = () => {
  const [productDetails, setProductDetails] = useState({
    productName: '',
    barcode: '',
    category: '',
    supplier: '',
    price: '',
    discount: '',
    minQuantity: '',
    giftVoucher: false,
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProductDetails({
        ...productDetails,
        [name]: checked,
      });
    } else {
      setProductDetails({
        ...productDetails,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    setProductDetails({
      ...productDetails,
      file: e.target.files[0],
    });
  };

  const handleSwitchChange = (checked) => {
    setProductDetails({
      ...productDetails,
      giftVoucher: checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    // Append form data
    formData.append('productName', productDetails.productName);
    formData.append('barcode', productDetails.barcode);
    formData.append('category', productDetails.category);
    formData.append('supplier', productDetails.supplier);
    formData.append('price', productDetails.price);
    formData.append('discount', productDetails.discount);
    formData.append('minQuantity', productDetails.minQuantity);
    formData.append('giftVoucher', productDetails.giftVoucher);
    if (productDetails.file) {
      formData.append('file', productDetails.file); // Add file to FormData
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type for file upload
        },
      });
  
      if (response.data.success) {
        alert('Product created successfully!');
        setProductDetails({
          productName: '',
          barcode: '',
          category: '',
          supplier: '',
          price: '',
          discount: '',
          minQuantity: '',
          giftVoucher: false,
          file: null,
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to create product');
    }
  };
  return (
    <div className="main-content p-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Form Header */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700">Create Product</h3>
            <p className="text-sm text-gray-500 mt-1">You can create new products from here</p>
          </div>

          <br />

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Product Image</label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {productDetails.file && (
              <span className="text-xs text-gray-500 mt-2">{productDetails.file.name}</span>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="productName"
              value={productDetails.productName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Product Name"
              required
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode</label>
            <input
              type="text"
              name="barcode"
              value={productDetails.barcode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Barcode"
              required
            />
          </div>

          {/* Category & Supplier */}
          <div className="grid grid-cols-2 gap-4">
            {/* Product Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Category</label>
              <select
                name="category"
                value={productDetails.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select...</option>
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <select
                name="supplier"
                value={productDetails.supplier}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Supplier...</option>
                <option value="Supplier 1">Supplier 1</option>
                <option value="Supplier 2">Supplier 2</option>
                <option value="Supplier 3">Supplier 3</option>
              </select>
            </div>
          </div>

          {/* Price & Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (LKR)</label>
              <input
                type="number"
                name="price"
                value={productDetails.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter Price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={productDetails.discount}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter Discount %"
              />
            </div>
          </div>

          {/* Minimum Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Quantity</label>
            <input
              type="number"
              name="minQuantity"
              value={productDetails.minQuantity}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter Minimum Quantity"
              required
            />
          </div>

          {/* Gift Voucher Toggle */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Gift Voucher</label>
            <Switch
              onChange={handleSwitchChange}
              checked={productDetails.giftVoucher}
              onColor="#3b82f6" // Blue color when ON
              offColor="#d1d5db" // Gray color when OFF
              uncheckedIcon={false}
              checkedIcon={false}
              height={24}
              width={48}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              New
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProducts;
