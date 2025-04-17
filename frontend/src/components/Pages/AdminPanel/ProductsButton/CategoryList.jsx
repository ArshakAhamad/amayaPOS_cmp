import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Download, X, Save } from "lucide-react";

const CategoryList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [editFormData, setEditFormData] = useState({
    category_name: "",
    description: "",
    status: "Active",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch categories from the backend API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        if (response.data.success) {
          setCategories(response.data.categories);
        } else {
          setError(response.data.message || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(error.response?.data?.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle edit click
  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setEditFormData({
      category_name: category.category_name,
      description: category.description || "",
      status: category.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/categories/${currentCategory.id}`,
        editFormData
      );

      if (response.data.success) {
        setCategories(
          categories.map((category) =>
            category.id === currentCategory.id
              ? { ...category, ...editFormData }
              : category
          )
        );
        setIsEditModalOpen(false);
        setSuccessMessage("Category updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data.message || "Failed to update category");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating category."
      );
    }
  };

  // Handle export functionality
  const handleExport = (type) => {
    if (filteredCategories.length === 0) {
      setError("No data to export");
      return;
    }

    let content = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `categories-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case "CSV":
        content = convertToCSV(filteredCategories);
        break;
      case "SQL":
        content = convertToSQL(filteredCategories);
        break;
      case "TXT":
        content = convertToTXT(filteredCategories);
        break;
      case "JSON":
        content = JSON.stringify(filteredCategories, null, 2);
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

  // Export helper functions
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
    const tableName = "categories";
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

  // Filter and paginate categories
  const filteredCategories = categories.filter(
    (category) =>
      category.category_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg m-6">{error}</div>
    );
  }

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {/* Edit Modal - Updated to match StoreType style */}
        {isEditModalOpen && currentCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-semibold">Edit Category</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <br></br>
              <form onSubmit={handleEditSubmit} className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="category_name"
                    value={editFormData.category_name}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
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

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Category Management
            </h2>
            <p className="text-gray-600">View and manage product categories</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              placeholder="🔍 Search categories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="flex items-center gap-2">
              <span className="text-gray-700 whitespace-nowrap">
                Entries per page:
              </span>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
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
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category, index) => {
                    const rowIndex =
                      (currentPage - 1) * entriesPerPage + index + 1;
                    return (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rowIndex}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.category_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {category.description || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.created_by || "Admin"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              category.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                          >
                            <span className="sr-only">Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {categories.length === 0
                        ? "No categories available"
                        : "No categories match your search"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * entriesPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                currentPage * entriesPerPage,
                filteredCategories.length
              )}
            </span>{" "}
            of <span className="font-medium">{filteredCategories.length}</span>{" "}
            categories
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2">
            {["CSV", "SQL", "TXT", "JSON"].map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filteredCategories.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={filteredCategories.length === 0}
              >
                Export {type}
              </button>
            ))}
          </div>
        </div>
        {""}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 hidden sm:block">
              Page {currentPage} of {totalPages}
            </div>

            <nav className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="First page"
              >
                «
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                Previous
              </button>

              {/* Always show first page */}
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-10 h-10 rounded ${
                  currentPage === 1 ? "bg-blue-600 text-white" : "border"
                }`}
              >
                1
              </button>

              {/* Show ellipsis if needed */}
              {currentPage > 3 && <span className="px-2">...</span>}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages - 2) }, (_, i) => {
                let pageNum;
                if (currentPage <= 3) {
                  pageNum = i + 2;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              {/* Show ellipsis if needed */}
              {currentPage < totalPages - 2 && (
                <span className="px-2">...</span>
              )}

              {/* Always show last page if different from first */}
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-10 h-10 rounded ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white"
                      : "border"
                  }`}
                >
                  {totalPages}
                </button>
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Next
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Last page"
              >
                »
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
