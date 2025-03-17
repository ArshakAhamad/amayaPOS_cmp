import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

const StoreType = () => {
  const [storeTypes, setStoreTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch store types from the backend
  useEffect(() => {
    const fetchStoreTypes = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `http://localhost:5000/api/store-types?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        if (data.success) {
          setStoreTypes(data.storeTypes);
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
  }, [page, limit]);

  // Handle search input change
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  // Filter store types based on search query
  const filteredStoreTypes = storeTypes.filter(
    (store) =>
      store.type.toLowerCase().includes(search.toLowerCase()) ||
      store.description.toLowerCase().includes(search.toLowerCase())
  );

  // Handle pagination
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  // Handle status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/store-types/${id}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: currentStatus === "Active" ? "Inactive" : "Active" }),
      });
      const data = await response.json();
      if (data.success) {
        // Update the store type status in the local state
        setStoreTypes((prev) =>
          prev.map((store) =>
            store.id === id
              ? { ...store, status: currentStatus === "Active" ? "Inactive" : "Active" }
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
    console.log(`Exporting data as ${type}`);
    // Implement export logic here
  };

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* 🔷 Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Manage Store Types</h3>
          <input
            type="text"
            placeholder="Search..."
            className="p-3 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <br />

        {/* 🔷 Filter Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="barcode-select-container">
            <span className="text-gray-600 text-sm">Entries per page: </span>
            <select
              className="p-3 border border-gray-300 rounded-lg"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* 🔷 Loading and Error Messages */}
        {loading && <p className="text-center text-blue-600">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {/* 🔷 Store Types Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[5%]">No</th>
                <th className="px-4 py-3 text-left w-[20%]">Store Type</th>
                <th className="px-4 py-3 text-left w-[25%]">Description</th>
                <th className="px-4 py-3 text-left w-[15%]">Created Date</th>
                <th className="px-4 py-3 text-left w-[15%]">Created By</th>
                <th className="px-4 py-3 text-center w-[10%]">Status</th>
                <th className="px-4 py-3 text-center w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStoreTypes.map((store, index) => (
                <tr key={store.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{store.type}</td>
                  <td className="px-4 py-3">{store.description}</td>
                  <td className="px-4 py-3">{store.createdDate}</td>
                  <td className="px-4 py-3">{store.createdBy}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        store.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      onClick={() => handleToggleStatus(store.id, store.status)}
                    >
                      {store.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 transition">
                      <Pencil width={18} height={18} /> {/* Edit Icon */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔷 Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredStoreTypes.length)}{" "}
            of {filteredStoreTypes.length} entries
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handlePrevious}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleNext}
              disabled={page * limit >= filteredStoreTypes.length}
            >
              Next
            </button>
          </div>
        </div>

        {/* 🔷 Export Buttons */}
        <div className="export-buttons flex flex-wrap gap-4 mt-6">
          {["CSV", "SQL", "TXT", "JSON"].map((type) => (
            <button
              key={type}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => handleExport(type)}
            >
              {`Export ${type}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreType;