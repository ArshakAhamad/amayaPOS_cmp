import React, { useState } from "react";
import { Pencil } from "lucide-react";

const StoreList = () => {
  const [stores, setStores] = useState([
    { id: 1, name: "Store 1", type: "Factory", description: "Main Factory", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { id: 2, name: "Store 2", type: "Store", description: "Retail Store", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { id: 3, name: "Store 3", type: "Store", description: "Retail Store", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Inactive" },
    { id: 4, name: "Store 4", type: "Dealer Store", description: "Dealer Distribution", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
  ]);

  const [search, setSearch] = useState("");
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.type.toLowerCase().includes(search.toLowerCase())
  );

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
                <th className="px-4 py-3 text-center w-[10%]">Actions</th> {/* Added Actions Column */}
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store, index) => (
                <tr key={store.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
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
            Showing 1 to {filteredStores.length} of {stores.length} entries
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

export default StoreList;