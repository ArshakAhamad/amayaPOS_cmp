import React, { useState, useEffect } from "react";
import axios from "axios";

const VoucherList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "N/A";
    const num = Number(value);
    return isNaN(num) ? "N/A" : num.toFixed(2);
  };

  const calculateExpireDate = (issuedDate, expirePeriod) => {
    if (!issuedDate || !expirePeriod) return "N/A";
    try {
      const issuedDateObj = new Date(issuedDate);
      issuedDateObj.setDate(issuedDateObj.getDate() + Number(expirePeriod));
      return issuedDateObj.toISOString().split("T")[0];
    } catch (e) {
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vouchers");
        if (response.data.success) {
          const validatedVouchers = response.data.vouchers.map((voucher) => ({
            ...voucher,
            value: Number(voucher.value) || 0,
            valid_days: Number(voucher.valid_days) || 0,
          }));
          setVouchers(validatedVouchers);
        } else {
          setError(response.data.message || "No vouchers found");
        }
      } catch (err) {
        setError("Failed to fetch vouchers. Please try again later.");
        console.error("Error fetching vouchers:", err);
      }
    };

    fetchVouchers();
  }, []);

  const handleCancel = async (voucherId) => {
    if (!window.confirm("Are you sure you want to cancel this voucher?"))
      return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/vouchers/${voucherId}/cancel`,
        {}
      );

      if (response.data.success) {
        setVouchers((prev) =>
          prev.map((v) =>
            v.id === voucherId
              ? { ...v, status: "Cancelled", active: "Inactive" }
              : v
          )
        );
        setSuccessMessage("Voucher cancelled successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
        setError("");
      } else {
        setError(response.data.message || "Failed to cancel voucher.");
      }
    } catch (err) {
      console.error("Error cancelling voucher:", err);
      if (err.response) {
        if (err.response.status === 404) {
          setError("Voucher not found or endpoint doesn't exist");
        } else {
          setError(
            err.response.data?.message ||
              "An error occurred while cancelling the voucher."
          );
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  // Handle export
  const handleExport = (type) => {
    if (filteredVouchers.length === 0) {
      setError("No data to export");
      return;
    }

    let content = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `vouchers-${timestamp}.${type.toLowerCase()}`;

    switch (type) {
      case "CSV":
        content = convertToCSV(filteredVouchers);
        break;
      case "SQL":
        content = convertToSQL(filteredVouchers);
        break;
      case "TXT":
        content = convertToTXT(filteredVouchers);
        break;
      case "JSON":
        content = JSON.stringify(filteredVouchers, null, 2);
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
    const tableName = "vouchers";
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

  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      voucher.code?.toLowerCase().includes(searchLower) ||
      voucher.status?.toLowerCase().includes(searchLower) ||
      voucher.value?.toString().includes(searchLower) ||
      voucher.created_at?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredVouchers.length / entriesPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
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
          {/* Title & Search */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Vouchers</h2>
            <input
              type="text"
              placeholder="Search vouchers..."
              className="p-2 border rounded-lg w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Voucher Details */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl">Voucher Details</h3>
            <div className="flex gap-4 items-center">
              <span>Entries per page: </span>
              <select
                className="p-2 border rounded-lg"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          {/* Voucher Table */}
          <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Voucher Code</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Expire Period</th>
                  <th className="px-4 py-3 text-left">Issued Date</th>
                  <th className="px-4 py-3 text-left">Expire Date</th>
                  <th className="px-4 py-3 text-left">Redeemed Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVouchers.length > 0 ? (
                  paginatedVouchers.map((voucher, index) => {
                    const status = voucher.status || "Issued";
                    const active = voucher.active || "Active";
                    const redeemedDate =
                      voucher.redeemed_date || "Not Redeemed";
                    const rowIndex =
                      (currentPage - 1) * entriesPerPage + index + 1;

                    return (
                      <tr
                        key={voucher.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{rowIndex}</td>
                        <td className="px-4 py-3 font-medium">
                          {voucher.code}
                        </td>
                        <td className="px-4 py-3">
                          {formatNumber(voucher.value)}
                        </td>
                        <td className="px-4 py-3">{voucher.valid_days} days</td>
                        <td className="px-4 py-3">
                          {voucher.created_at || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {calculateExpireDate(
                            voucher.created_at,
                            voucher.valid_days
                          )}
                        </td>
                        <td className="px-4 py-3">{redeemedDate}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              status === "Redeemed"
                                ? "text-green-600"
                                : status === "Cancelled"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              active === "Active"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {active}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCancel(voucher.id)}
                            disabled={
                              status === "Cancelled" || status === "Redeemed"
                            }
                            className={`px-3 py-1 rounded ${
                              status === "Cancelled" || status === "Redeemed"
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      {vouchers.length === 0
                        ? "Loading vouchers..."
                        : "No vouchers found matching your search"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600">
            Showing {paginatedVouchers.length} of {filteredVouchers.length}{" "}
            vouchers
          </div>

          {/* 
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
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
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-1">...</span>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div> */}

          {/* Export Buttons */}
          <div className="mt-6 flex gap-4">
            {["CSV", "SQL", "TXT", "JSON"].map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                disabled={filteredVouchers.length === 0}
              >
                Export {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherList;
