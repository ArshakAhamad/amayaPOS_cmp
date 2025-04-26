import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SupplierList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/suppliers", {
        params: {
          search: searchQuery,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        },
      });

      setSuppliers(response.data.suppliers);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.suppliers.length,
        totalPages: Math.ceil(
          response.data.suppliers.length / prev.itemsPerPage
        ),
      }));
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [searchQuery, pagination.currentPage, pagination.itemsPerPage]);

  const handleStatusChange = async (id, index) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/suppliers/${id}/toggle-status`
      );
      if (response.data.success) {
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Error toggling supplier status:", error);
      setError("Failed to update supplier status.");
    }
  };

  const handleSupplierBills = (supplier) => {
    navigate(`/AdminPanel/SupplierBills/${supplier.id}`, {
      state: {
        supplierName: supplier.supplier_name,
        outstandingAmount: supplier.outstanding,
      },
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newItemsPerPage),
    }));
  };

  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    pagination.totalItems
  );

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="p-2 border border-gray-300 rounded-lg"
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                disabled={loading}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              {"  "}
              <input
                type="text"
                className="p-2 border border-gray-300 rounded-lg w-64"
                placeholder="Search Supplier 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-right">Outstanding (LKR)</th>
                <th className="px-4 py-3 text-left">Created Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    {searchQuery
                      ? "No matching suppliers"
                      : "No suppliers found"}
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        index +
                        1}
                    </td>
                    <td className="px-4 py-3">{supplier.supplier_name}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {supplier.outstanding.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(supplier.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          supplier.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-3">
                      <button
                        onClick={() => handleStatusChange(supplier.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={() => handleSupplierBills(supplier)}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        Bill Settlement
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600">
            Showing {startItem} to {endItem} of {pagination.totalItems} entries
          </p>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md ${
                pagination.currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
            >
              Previous
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (
                  pagination.currentPage >=
                  pagination.totalPages - 2
                ) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 rounded-md ${
                      pagination.currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
            {pagination.totalPages > 5 &&
              pagination.currentPage < pagination.totalPages - 2 && (
                <span className="px-2">...</span>
              )}
            {pagination.totalPages > 5 &&
              pagination.currentPage < pagination.totalPages - 2 && (
                <button
                  className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={loading}
                >
                  {pagination.totalPages}
                </button>
              )}

            <button
              className={`px-4 py-2 rounded-md ${
                pagination.currentPage === pagination.totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage === pagination.totalPages || loading
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
