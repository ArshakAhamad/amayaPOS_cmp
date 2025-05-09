import React, { useState, useEffect } from "react";
import {
  Pencil,
  Download,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";

const ProductList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    product_name: "",
    barcode: "",
    category: "",
    price: 0,
    discount: 0,
    last_cost: 0,
    avg_cost: 0,
    status: "Active",
  });

  // Status color mapping
  const statusColors = {
    Active: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    Inactive: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError(response.data.message || "Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.response?.data?.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle edit click
  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setEditFormData({
      product_name: product.product_name,
      barcode: product.barcode,
      category: product.category,
      price: product.price || 0,
      discount: product.discount || 0,
      last_cost: product.last_cost || 0,
      avg_cost: product.avg_cost || 0,
      status: product.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]:
        name === "price" ||
        name === "discount" ||
        name === "last_cost" ||
        name === "avg_cost"
          ? parseFloat(value) || 0
          : value,
    });
  };

  // Handle form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/${currentProduct.id}`,
        editFormData
      );

      if (response.data.success) {
        setProducts(
          products.map((product) =>
            product.id === currentProduct.id
              ? { ...product, ...editFormData }
              : product
          )
        );
        setIsEditModalOpen(false);
        setSuccessMessage("Product updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data.message || "Failed to update product");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating product."
      );
    }
  };

  // Handle export functionality
  const handleExport = (type) => {
    if (filteredProducts.length === 0) {
      setError("No data to export");
      return;
    }

    let content = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `products-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case "CSV":
        content = convertToCSV(filteredProducts);
        break;
      case "SQL":
        content = convertToSQL(filteredProducts);
        break;
      case "TXT":
        content = convertToTXT(filteredProducts);
        break;
      case "JSON":
        content = JSON.stringify(filteredProducts, null, 2);
        break;
      default:
        return;
    }

    downloadFile(
      content,
      filename,
      type === "JSON" ? "application/json" : "text/plain"
    );
  };

  // Helper functions for export
  const convertToCSV = (data) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((value) => {
          if (value === null || value === undefined) return "";
          const val =
            typeof value === "object"
              ? JSON.stringify(value)
              : value.toString();
          return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const convertToSQL = (data) => {
    if (data.length === 0) return "";
    const tableName = "products";
    const columns = Object.keys(data[0]).join(", ");
    const values = data
      .map(
        (obj) =>
          `(${Object.values(obj)
            .map((value) => {
              if (value === null || value === undefined) return "NULL";
              const val =
                typeof value === "object"
                  ? JSON.stringify(value)
                  : value.toString();
              return typeof val === "string"
                ? `'${val.replace(/'/g, "''")}'`
                : val;
            })
            .join(", ")})`
      )
      .join(",\n");

    return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
  };

  const convertToTXT = (data) => {
    return data
      .map((obj) =>
        Object.entries(obj)
          .map(([key, value]) => {
            const val =
              value === null || value === undefined
                ? "N/A"
                : typeof value === "object"
                ? JSON.stringify(value)
                : value.toString();
            return `${key}: ${val}`;
          })
          .join("\n")
      )
      .join("\n\n");
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter and paginate products
  const filteredProducts = products.filter(
    (product) =>
      product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.includes(searchQuery) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg m-6">{error}</div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div
        className={`main-content flex-1 ml-${
          isSidebarOpen ? "64" : "20"
        } transition-all duration-300`}
      >
        <div className="p-6">
          {/* Edit Modal */}
          {isEditModalOpen && currentProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-lg font-semibold">Edit Product</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <br></br>
                <form onSubmit={handleEditSubmit} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="product_name"
                        value={editFormData.product_name}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={editFormData.barcode}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={editFormData.category}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={editFormData.price}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="discount"
                        value={editFormData.discount}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Cost
                      </label>
                      <input
                        type="number"
                        step="0.00"
                        name="last_cost"
                        value={editFormData.last_cost}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Cost
                      </label>
                      <input
                        type="number"
                        step="0.00"
                        name="avg_cost"
                        value={editFormData.avg_cost}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <p className="text-gray-600">View and manage all products</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <span className="text-gray-700 whitespace-nowrap">
                Rows per page:
              </span>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                title="Select number of rows to display per page"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>{" "}
              <input
                type="text"
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                placeholder="🔍 Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <br></br>
          {/* Export Buttons - Moved above table */}
          <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {["CSV", "SQL", "TXT", "JSON"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    filteredProducts.length === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  disabled={filteredProducts.length === 0}
                  title={`Export product data as ${type} file`}
                >
                  Export as {type}
                </button>
              ))}
            </div>
          </div>
          <br></br>
          {/* Product Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => {
                    const rowIndex =
                      (currentPage - 1) * rowsPerPage + index + 1;
                    const status = product.status || "Active";
                    const statusConfig =
                      statusColors[status] || statusColors.Active;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rowIndex}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.barcode || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.price?.toFixed(2) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.discount?.toFixed(2) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.last_cost?.toFixed(2) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.avg_cost?.toFixed(2) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.icon}
                            <span className="text-xs font-medium">
                              {status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="Edit product details"
                          >
                            <Pencil size={16} />
                            <span className="sr-only">Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {products.length === 0
                        ? "No products available"
                        : "No products match your search"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * rowsPerPage, filteredProducts.length)}
              </span>{" "}
              of <span className="font-medium">{filteredProducts.length}</span>{" "}
              products
            </div>

            {/* Improved Pagination Controls */}
            {totalPages > 1 && (
              <nav className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-md border text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                        title={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                      ...
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <span className="sr-only">Previous</span>
                </button>{" "}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <span className="sr-only">Next</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
