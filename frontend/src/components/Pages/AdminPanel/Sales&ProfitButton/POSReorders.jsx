import React, { useState, useEffect } from "react";
import {
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const POSReorders = () => {
  const [reorderProducts, setReorderProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reorder products from the backend
  useEffect(() => {
    const fetchReorderProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/reorders");
        if (!response.ok) {
          throw new Error("Failed to fetch reorder products");
        }
        const data = await response.json();
        setReorderProducts(data);
      } catch (error) {
        console.error("Error fetching reorder products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReorderProducts();
  }, []);

  // Format currency with LKR symbol and commas
  const formatCurrency = (value) => {
    return typeof value === "number"
      ? `LKR ${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`
      : "N/A";
  };

  // Format numbers with commas
  const formatNumber = (value) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  // Handle export functionality
  const handleExport = (type) => {
    if (reorderProducts.length === 0) {
      alert("No data to export");
      return;
    }

    let content = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `reorders-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case "CSV":
        content = convertToCSV(reorderProducts);
        break;
      case "SQL":
        content = convertToSQL(reorderProducts);
        break;
      case "TXT":
        content = convertToTXT(reorderProducts);
        break;
      case "JSON":
        content = JSON.stringify(reorderProducts, null, 2);
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
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((value) =>
          typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
        )
        .join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const convertToSQL = (data) => {
    const tableName = "reorders";
    const columns = Object.keys(data[0]).join(", ");
    const values = data
      .map(
        (obj) =>
          `(${Object.values(obj)
            .map((value) =>
              typeof value === "string"
                ? `'${value.replace(/'/g, "''")}'`
                : value
            )
            .join(", ")})`
      )
      .join(",\n");

    return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
  };

  const convertToTXT = (data) => {
    return data
      .map((obj) =>
        Object.entries(obj)
          .map(([key, value]) => `${key}: ${value}`)
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reorderProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reorderProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="main-content p-6">Loading reorder products...</div>;
  }

  if (error) {
    return <div className="main-content p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Title & Export Dropdown */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Reorders</h2>

          <div className="relative">
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              {["CSV", "SQL", "TXT", "JSON"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  {`Export as ${type}`}
                </button>
              ))}
            </div>
          </div>
        </div>
        <br></br>
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Sale Qty (Last 30 Days)</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Last Purchased Price</th>
                <th className="px-4 py-3 text-left">Minimum Stock</th>
                <th className="px-4 py-3 text-left">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.product}</td>
                  <td className="px-4 py-3">
                    {formatNumber(product.saleQtyLast30Days)}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(product.lastPurchasedPrice)}
                  </td>
                  <td className="px-4 py-3">
                    {formatNumber(product.minimumStock)}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold flex items-center ${
                      product.currentStock < product.minimumStock
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {product.currentStock < product.minimumStock && (
                      <AlertTriangle className="mr-1" size={16} />
                    )}
                    {formatNumber(product.currentStock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, reorderProducts.length)} of{" "}
            {reorderProducts.length} items
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>

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
                  onClick={() => paginate(pageNum)}
                  className={`w-10 h-10 rounded border ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="flex items-center px-2">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => paginate(totalPages)}
                className={`w-10 h-10 rounded border ${
                  currentPage === totalPages
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSReorders;
