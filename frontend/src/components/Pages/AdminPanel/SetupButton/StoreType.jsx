import React, { useState, useEffect } from "react";
import { Pencil, Download, X, Save } from "lucide-react";

const StoreType = () => {
  const [storeTypes, setStoreTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditStore, setCurrentEditStore] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type: "",
    description: "",
    status: "Active",
  });

  // Fetch store types from the backend
  useEffect(() => {
    const fetchStoreTypes = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `http://localhost:5000/api/store-types?page=${page}&limit=${limit}&search=${search}`
        );
        const data = await response.json();
        if (data.success) {
          setStoreTypes(data.storeTypes);
          setTotalCount(data.totalCount);
        } else {
          setError(data.message || "Failed to fetch store types.");
        }
      } catch (err) {
        setError("Error fetching store types. Please try again.");
        console.error("Error fetching store types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreTypes();
  }, [page, limit, search]);

  // Handle edit button click
  const handleEditClick = (store) => {
    setCurrentEditStore(store);
    setEditFormData({
      type: store.type,
      description: store.description || "",
      status: store.status,
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/store-types/${currentEditStore.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setStoreTypes((prev) =>
          prev.map((store) =>
            store.id === currentEditStore.id
              ? { ...store, ...editFormData }
              : store
          )
        );
        setIsEditModalOpen(false);
      } else {
        setError(data.message || "Failed to update store type.");
      }
    } catch (err) {
      setError("Error updating store type. Please try again.");
      console.error("Error updating store type:", err);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/store-types/${id}/toggle-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: currentStatus === "Active" ? "Inactive" : "Active",
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setStoreTypes((prev) =>
          prev.map((store) =>
            store.id === id
              ? {
                  ...store,
                  status: currentStatus === "Active" ? "Inactive" : "Active",
                }
              : store
          )
        );
      } else {
        setError(data.message || "Failed to toggle status.");
      }
    } catch (err) {
      setError("Error toggling status. Please try again.");
      console.error("Error toggling status:", err);
    }
  };

  // Handle export functionality
  const handleExport = (type) => {
    if (storeTypes.length === 0) {
      setError("No data to export");
      return;
    }

    let content = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `store-types-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case "CSV":
        content = convertToCSV(storeTypes);
        break;
      case "SQL":
        content = convertToSQL(storeTypes);
        break;
      case "TXT":
        content = convertToTXT(storeTypes);
        break;
      case "JSON":
        content = JSON.stringify(storeTypes, null, 2);
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

  // Export helper functions (remain the same as before)
  const convertToCSV = (data) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((value) => {
          if (value === null || value === undefined) return "";
          return typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const convertToSQL = (data) => {
    if (data.length === 0) return "";
    const tableName = "store_types";
    const columns = Object.keys(data[0]).join(", ");
    const values = data
      .map(
        (obj) =>
          `(${Object.values(obj)
            .map((value) => {
              if (value === null || value === undefined) return "NULL";
              return typeof value === "string"
                ? `'${value.replace(/'/g, "''")}'`
                : value;
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
              value === null || value === undefined ? "N/A" : value.toString();
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

  return (
    <div className="main-content p-6">
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Edit Store Type</h3>
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
                  Store Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditFormChange}
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
                  onChange={handleEditFormChange}
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
                  onChange={handleEditFormChange}
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

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Header Section (same as before) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <p className="text-gray-600">View and manage all store types</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <span className="text-gray-700 whitespace-nowrap">
              Rows per page:
            </span>
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>{" "}
            <input
              type="text"
              placeholder="🔍 Search store types..."
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Loading and Error Messages (same as before) */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}
        <br></br>
        <div className="flex flex-wrap gap-2">
          {["CSV", "SQL", "TXT", "JSON"].map((type) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                storeTypes.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={storeTypes.length === 0}
            >
              Export as {type}
            </button>
          ))}
        </div>
        <br></br>
        {/* Store Types Table (same as before except for the edit button) */}
        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store Type
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
                {storeTypes.length > 0 ? (
                  storeTypes.map((store, index) => (
                    <tr
                      key={store.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {store.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {store.description || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.createdDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                            store.status === "Active"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                          onClick={() =>
                            handleToggleStatus(store.id, store.status)
                          }
                        >
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(store)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                        >
                          <Pencil size={16} className="inline" />
                          <span className="sr-only"></span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {loading ? "Loading..." : "No store types found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Section (same as before) */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * limit, totalCount)}
            </span>{" "}
            of <span className="font-medium">{totalCount}</span> store types
          </div>
        </div>

        {/* Pagination (same as before) */}
        {totalCount > limit && (
          <div className="mt-4 flex justify-center">
            <nav
              className="inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>

              {Array.from(
                { length: Math.min(5, Math.ceil(totalCount / limit)) },
                (_, i) => {
                  let pageNum;
                  if (Math.ceil(totalCount / limit) <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= Math.ceil(totalCount / limit) - 2) {
                    pageNum = Math.ceil(totalCount / limit) - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              {Math.ceil(totalCount / limit) > 5 &&
                page < Math.ceil(totalCount / limit) - 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}

              <button
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(totalCount / limit), p + 1))
                }
                disabled={page === Math.ceil(totalCount / limit)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreType;
