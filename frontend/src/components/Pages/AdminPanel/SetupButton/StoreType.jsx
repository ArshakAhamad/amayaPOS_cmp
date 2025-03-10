import React, { useState } from "react";
import { Pencil } from "lucide-react";

const StoreType = () => {
  const [storeTypes, setStoreTypes] = useState([
    { id: 1, type: "Factory", description: "Factory Store", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { id: 2, type: "Store", description: "General Store", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { id: 3, type: "Dealer Store", description: "Dealer Store", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Inactive" },
    { id: 4, type: "Sales Rep Store", description: "Sales Representative Store", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
  ]);

  const [search, setSearch] = useState("");

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredStoreTypes = storeTypes.filter(
    (store) =>
      store.type.toLowerCase().includes(search.toLowerCase()) ||
      store.description.toLowerCase().includes(search.toLowerCase())
  );

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
<br></br>
        {/* 🔷 Filter Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="barcode-select-container">
            <span className="text-gray-600 text-sm">Entries per page: </span>
            <select className="p-3 border border-gray-300 rounded-lg">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

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
                <th className="px-4 py-3 text-center w-[10%]">Actions</th> {/* Added Actions Column */}
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
            Showing 1 to {filteredStoreTypes.length} of {storeTypes.length} entries
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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

export default StoreType;