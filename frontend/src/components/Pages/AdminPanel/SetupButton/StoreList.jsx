import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch stores from the backend
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:5000/api/stores");
        const data = await response.json();
        if (data.success) {
          setStores(data.stores);
        } else {
          setError(data.message || "Failed to fetch stores.");
        }
      } catch (err) {
        setError("Error fetching stores. Please try again.");
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Filter stores based on search query
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.type.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastStore = currentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handling pagination button disabling
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* 🔷 Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Stores</h2>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 🔷 Loading and Error Messages */}
        {loading && <p className="text-center text-blue-600">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {/* 🔷 Stores Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-[5%]">No</th>
                <th className="px-4 py-3 text-left w-[20%]">Store</th>
                <th className="px-4 py-3 text-left w-[15%]">Type</th>
                <th className="px-4 py-3 text-left w-[20%]">Description</th>
                <th className="px-4 py-3 text-left w-[20%]">Created Date</th>
                <th className="px-4 py-3 text-left w-[15%]">Created By</th>
                <th className="px-4 py-3 text-center w-[10%]">Status</th>
                <th className="px-4 py-3 text-center w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStores.map((store, index) => (
                <tr key={store.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1 + indexOfFirstStore}</td>
                  <td className="px-4 py-3">{store.name}</td>
                  <td className="px-4 py-3">{store.type}</td>
                  <td className="px-4 py-3">{store.description}</td>
                  <td className="px-4 py-3">{store.createdDate}</td>
                  <td className="px-4 py-3">{store.createdBy}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        store.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {store.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 transition">
                      <Pencil width={18} height={18} />
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
            Showing {indexOfFirstStore + 1} to {Math.min(indexOfLastStore, filteredStores.length)}{" "}
            of {filteredStores.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={isFirstPage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={isLastPage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
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
            >
              {`Export ${type}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreList;