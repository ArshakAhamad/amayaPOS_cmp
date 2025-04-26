import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Pencil,
  Download,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const SalesRepList = () => {
  const [salesReps, setSalesReps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRep, setCurrentRep] = useState(null);
  const [editFormData, setEditFormData] = useState({
    salesrep_name: "",
    user_name: "",
    store: "",
    description: "",
    email: "",
    phone: "",
    remarks: "",
    notification_method: "",
    status: "Active",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSalesReps = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/sales-reps"
        );
        if (response.data.success) {
          setSalesReps(response.data.salesReps);
        } else {
          setError(response.data.message || "Failed to fetch sales reps");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching sales reps");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReps();
  }, []);

  const filteredSalesReps = salesReps.filter(
    (rep) =>
      rep.salesrep_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredSalesReps.length / rowsPerPage);
  const paginatedSalesReps = filteredSalesReps.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/sales-rep/status/${id}`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        setSalesReps((prevReps) =>
          prevReps.map((rep) =>
            rep.salesrep_id === id ? { ...rep, status: newStatus } : rep
          )
        );
      } else {
        setError("Failed to update status");
      }
    } catch (error) {
      setError("Error updating status");
    }
  };

  const handleEditClick = (rep) => {
    setCurrentRep(rep);
    setEditFormData({
      salesrep_name: rep.salesrep_name,
      user_name: rep.user_name,
      store: rep.store,
      description: rep.description || "",
      email: rep.email,
      phone: rep.phone || "",
      remarks: rep.remarks || "",
      notification_method: rep.notification_method || "",
      status: rep.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/sales-reps/${currentRep.salesrep_id}`,
        editFormData
      );

      if (response.data.success) {
        setSalesReps((prevReps) =>
          prevReps.map((rep) =>
            rep.salesrep_id === currentRep.salesrep_id
              ? { ...rep, ...editFormData }
              : rep
          )
        );
        setIsEditModalOpen(false);
        setSuccessMessage("Sales rep updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data.message || "Failed to update sales rep");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating sales rep");
    }
  };

  const handleExport = (type) => {
    if (filteredSalesReps.length === 0) {
      setError("No data to export");
      return;
    }

    let content = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `sales-reps-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case "CSV":
        content = convertToCSV(filteredSalesReps);
        break;
      case "SQL":
        content = convertToSQL(filteredSalesReps);
        break;
      case "TXT":
        content = convertToTXT(filteredSalesReps);
        break;
      case "JSON":
        content = JSON.stringify(filteredSalesReps, null, 2);
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
    const tableName = "sales_reps";
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

        {/* Edit Modal */}
        {isEditModalOpen && currentRep && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-semibold">
                  Edit Sales Representative
                </h3>
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="salesrep_name"
                      value={editFormData.salesrep_name}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      value={editFormData.user_name}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store
                    </label>
                    <input
                      type="text"
                      name="store"
                      value={editFormData.store}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Method
                    </label>
                    <input
                      type="text"
                      name="notification_method"
                      value={editFormData.notification_method}
                      onChange={handleEditFormChange}
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
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
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
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={editFormData.remarks}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
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
              Sales Representatives
            </h2>
            <p className="text-gray-600">Manage your sales team members</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search reps 🔍"
                className="pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
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
                    Sales Rep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
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
                {paginatedSalesReps.length > 0 ? (
                  paginatedSalesReps.map((rep, index) => {
                    const rowIndex =
                      (currentPage - 1) * rowsPerPage + index + 1;
                    return (
                      <tr
                        key={rep.salesrep_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rowIndex}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rep.salesrep_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rep.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rep.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rep.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rep.store}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                              rep.status === "Active"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                            onClick={() =>
                              toggleStatus(rep.salesrep_id, rep.status)
                            }
                            title={`Click to change to ${
                              rep.status === "Active" ? "Inactive" : "Active"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(rep)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="Edit sales rep"
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
                      colSpan="8"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {salesReps.length === 0
                        ? "No sales reps available"
                        : "No sales reps match your search"}
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
              {(currentPage - 1) * rowsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * rowsPerPage, filteredSalesReps.length)}
            </span>{" "}
            of <span className="font-medium">{filteredSalesReps.length}</span>{" "}
            sales reps
          </div>

          {/* Export Buttons - Moved to top right */}
          <div className="flex flex-wrap gap-2">
            {["CSV", "SQL", "TXT", "JSON"].map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filteredSalesReps.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={filteredSalesReps.length === 0}
                title={`Export data as ${type} format`}
              >
                Export as {type}
              </button>
            ))}
          </div>
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            <nav
              className="inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <span className="sr-only">Previous</span>
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
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                    title={`Go to page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <span className="sr-only">Next</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesRepList;
