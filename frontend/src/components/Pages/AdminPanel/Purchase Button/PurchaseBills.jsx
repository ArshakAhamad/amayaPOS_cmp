import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const PurchaseBills = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchPurchaseBills = async () => {
      try {
        const response = await axios.get("/api/purchase-bills", {
          withCredentials: true,
          baseURL:
            process.env.NODE_ENV === "development"
              ? "http://localhost:5000"
              : window.location.origin,
        });

        const formattedData = response.data.map((bill) => ({
          ...bill,
          billType: bill.billType || "POS_GRN",
          billNo: bill.billNo || bill.id,
          amount:
            typeof bill.amount === "string"
              ? parseFloat(bill.amount.replace(/,/g, ""))
              : Number(bill.amount),
        }));

        setPurchaseBills(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching purchase bills:", err);
        setError(err.response?.data?.error || "Failed to fetch purchase bills");
        setLoading(false);
      }
    };

    fetchPurchaseBills();
  }, []);

  const filteredBills = purchaseBills.filter(
    (bill) =>
      (bill.supplier?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) || (bill.billNo?.toString() || "").includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBills.length / rowsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Export functions
  const handleExport = (format) => {
    let content = "";
    const headers = [
      "No",
      "Date",
      "Bill Type",
      "Bill No",
      "Supplier",
      "Amount (LKR)",
    ];

    switch (format) {
      case "CSV":
        content = [
          headers.join(","),
          ...filteredBills.map((bill, index) =>
            [
              index + 1,
              bill.date,
              bill.billType,
              bill.billNo,
              bill.supplier,
              bill.amount.toFixed(2),
            ].join(",")
          ),
        ].join("\n");
        break;
      case "JSON":
        content = JSON.stringify(filteredBills, null, 2);
        break;
      case "TXT":
        content = [
          headers.join("\t"),
          ...filteredBills.map((bill, index) =>
            [
              index + 1,
              bill.date,
              bill.billType,
              bill.billNo,
              bill.supplier,
              bill.amount.toFixed(2),
            ].join("\t")
          ),
        ].join("\n");
        break;
      case "SQL":
        content = `INSERT INTO purchase_bills (${headers
          .map((h) => `\`${h}\``)
          .join(", ")}) VALUES\n`;
        content +=
          filteredBills
            .map((bill, index) => {
              const values = [
                index + 1,
                bill.date,
                bill.billType,
                bill.billNo,
                bill.supplier,
                bill.amount.toFixed(2),
              ].map((value) =>
                typeof value === "string"
                  ? `'${value.replace(/'/g, "''")}'`
                  : value
              );
              return `(${values.join(", ")})`;
            })
            .join(",\n") + ";";
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-bills-${new Date()
      .toISOString()
      .slice(0, 10)}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* Title & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Purchase Bills</h2>
            <p className="text-gray-600">View and manage purchase bills</p>
          </div>
        </div>

        {/* Export Controls */}
        <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>{" "}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by bill no or supplier  🔍"
            />
          </div>
          <br></br>
          <div className="flex flex-wrap gap-2">
            {["CSV", "SQL", "TXT", "JSON"].map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filteredBills.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={filteredBills.length === 0}
                title={`Export data as ${type} format`}
              >
                Export as {type}
              </button>
            ))}
          </div>
        </div>
        <br></br>
        {/* Table Section */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : filteredBills.length > 0 ? (
            <>
              <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Bill Type</th>
                    <th className="px-4 py-3 text-left">Bill No</th>
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-left">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBills.map((bill, index) => (
                    <tr
                      key={bill.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3">{bill.date}</td>
                      <td className="px-4 py-3">{bill.billType}</td>
                      <td className="px-4 py-3">{bill.billNo}</td>
                      <td className="px-4 py-3">{bill.supplier}</td>
                      <td className="px-4 py-3 font-bold text-red-500">
                        {bill.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Enhanced Pagination */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * rowsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * rowsPerPage, filteredBills.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredBills.length}</span>{" "}
                  bills
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    title="Previous page"
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
                        className={`w-10 h-10 rounded ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    title="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="italic text-gray-500">
                {purchaseBills.length === 0
                  ? "No purchase bills found in the system"
                  : "No bills match your search criteria"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseBills;
