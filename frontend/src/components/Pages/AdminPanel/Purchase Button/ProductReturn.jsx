import React, { useState, useEffect } from "react";
import api from '../../../../../../backend/models/api';
import { useNavigate } from "react-router-dom";

const ProductReturn = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    allProducts: true,
    saving: false
  });
  const [error, setError] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        const [returnsRes, productsRes] = await Promise.all([
          api.get('/product-returns'),
          api.get('/products')
        ]);
        
        // Transform data to match frontend expectations
        setProducts(returnsRes.data?.data?.map(item => ({
          ...item,
          unitCost: item.unit_cost,
          totalCost: item.total_cost,
          avgCost: item.avg_cost,
          product_name: item.product_name
        })) || []);
        
        setAllProducts(productsRes.data || []);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(prev => ({ ...prev, products: false, allProducts: false }));
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e, index, field) => {
    try {
      const updatedProducts = [...products];
      const value = e.target.value;
      
      updatedProducts[index][field] = field === 'quantity' ? parseInt(value) || 0 : 
                                      field === 'unitCost' ? parseFloat(value) || 0 : 
                                      value;
      
      if (field === 'unitCost' || field === 'quantity') {
        updatedProducts[index].totalCost = 
          (updatedProducts[index].unitCost || 0) * 
          (updatedProducts[index].quantity || 0);
        updatedProducts[index].avgCost = updatedProducts[index].totalCost;
      }
      
      setProducts(updatedProducts);
    } catch (err) {
      setError('Failed to update product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        date: new Date().toISOString().split('T')[0],
        product_id: "",
        product_name: "",
        barcode: "",
        unitCost: 0,
        quantity: 1,
        totalCost: 0,
        avgCost: 0,
        stock: 0
      }
    ]);
  };

  const handleRemoveProduct = async (index) => {
    try {
      const productToRemove = products[index];
      
      if (productToRemove?.id) {
        await api.delete(`/product-returns/${productToRemove.id}`);
      }
      
      setProducts(products.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Delete Error:', err);
      setError('Failed to remove product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setError(null);
      
      const savePromises = products.map(product => {
        const payload = {
          date: product.date,
          product_id: product.product_id,
          unit_cost: product.unitCost,
          quantity: product.quantity,
          total_cost: product.totalCost,
          avg_cost: product.avgCost,
          stock: product.stock
        };

        return product.id 
          ? api.put(`/product-returns/${product.id}`, payload)
          : api.post('/product-returns', payload);
      });
      
      await Promise.all(savePromises);
      
      // Refresh data after save
      const { data } = await api.get('/product-returns');
      setProducts(data?.data?.map(item => ({
        ...item,
        unitCost: item.unit_cost,
        totalCost: item.total_cost,
        avgCost: item.avg_cost,
        product_name: item.product_name
      })) || []);
    } catch (err) {
      console.error('Save Error:', err);
      setError('Failed to save changes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleProductSelect = (e, index) => {
    try {
      const productId = e.target.value;
      const selectedProduct = allProducts.find(p => p.id == productId);
      
      if (selectedProduct) {
        const updatedProducts = [...products];
        updatedProducts[index] = {
          ...updatedProducts[index],
          product_id: selectedProduct.id,
          product_name: selectedProduct.product_name,
          barcode: selectedProduct.barcode,
          unitCost: selectedProduct.last_cost || selectedProduct.price || 0,
          stock: selectedProduct.min_quantity || 0,
          quantity: 1,
          totalCost: selectedProduct.last_cost || selectedProduct.price || 0,
          avgCost: selectedProduct.avg_cost || selectedProduct.price || 0
        };
        setProducts(updatedProducts);
      }
    } catch (err) {
      setError('Failed to select product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBarcodeSearch = (e) => {
    const barcode = e.target.value;
    setBarcodeInput(barcode);
    
    if (barcode.length > 2) {
      const matchingProduct = allProducts.find(
        p => p.barcode?.toLowerCase().includes(barcode.toLowerCase())
      );
      
      if (matchingProduct) {
        setProducts([
          ...products,
          {
            date: new Date().toISOString().split('T')[0],
            product_id: matchingProduct.id,
            product_name: matchingProduct.product_name,
            barcode: matchingProduct.barcode,
            unitCost: matchingProduct.last_cost || matchingProduct.price || 0,
            quantity: 1,
            totalCost: matchingProduct.last_cost || matchingProduct.price || 0,
            avgCost: matchingProduct.avg_cost || matchingProduct.price || 0,
            stock: matchingProduct.min_quantity || 0
          }
        ]);
        setBarcodeInput("");
      }
    }
  };

  if (loading.products || loading.allProducts) {
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
          <div className="text-red-500 text-center p-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Scan Barcode (Alt + A)"
              className="p-3 border border-gray-300 rounded-lg w-64"
              value={barcodeInput}
              onChange={handleBarcodeSearch}
              onKeyDown={(e) => e.key === 'a' && e.altKey && e.target.focus()}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Barcode</th>
                <th className="px-6 py-3 text-right">Unit Cost (LKR)</th>
                <th className="px-6 py-3 text-center">Quantity</th>
                <th className="px-6 py-3 text-right">Total Cost (LKR)</th>
                <th className="px-6 py-3 text-right">Avg Cost (LKR)</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
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
                    <td className="px-6 py-3">
                      <select
                        value={product.product_id}
                        onChange={(e) => handleProductSelect(e, index)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Product</option>
                        {allProducts.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.product_name} (LKR {p.price?.toFixed(2) || '0.00'})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">{product.barcode || 'N/A'}</td>
                    <td className="px-6 py-3 text-right">
                      <input
                        type="number"
                        value={product.unitCost}
                        onChange={(e) => handleInputChange(e, index, "unitCost")}
                        className="w-full p-2 border rounded text-right"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleInputChange(e, index, "quantity")}
                        className="w-full p-2 border rounded text-center"
                        min="1"
                      />
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-red-500">
                      {product.totalCost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {product.avgCost?.toFixed(2) || '0.00'}
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
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No product returns found. Add a product to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Add New Product
          </button>
          <button
            onClick={handleSave}
            disabled={loading.saving || products.length === 0}
            className={`px-6 py-3 ${loading.saving || products.length === 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md`}
          >
            {loading.saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {products.length > 0 && (
          <div className="flex justify-between items-center mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xl font-semibold">Total : </p>
            <p className="text-xl font-semibold text-red-500">
              {products
                .reduce((acc, product) => acc + (product.totalCost || 0), 0)
                .toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReturn;