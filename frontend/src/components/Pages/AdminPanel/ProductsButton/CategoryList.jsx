import React, { useState } from "react";
import { Pencil } from "lucide-react";

const CategoryList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: 1, category: "Category 1", description: "Description 1", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { id: 2, category: "Category 2", description: "Description 2", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Inactive" },
    { id: 3, category: "Category 3", description: "Description 3", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Active" },
    { id: 4, category: "Category 4", description: "Description 4", createdDate: "2024-04-21 16:44:14", createdBy: "Admin", status: "Inactive" },
  ];

  const filteredCategories = categories.filter((category) =>
    category.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-content p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        {/* 🔷 Title & Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Categories</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search Categories..."
          />
        </div>

        {/* 🔷 Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Created Date</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th> {/* Added Actions Column */}
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category, index) => (
                <tr key={category.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{category.category}</td>
                  <td className="px-4 py-3">{category.description}</td>
                  <td className="px-4 py-3">{category.createdDate}</td>
                  <td className="px-4 py-3">{category.createdBy}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        category.status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 transition">
                      <Pencil width={18} height={18} /> {/* Edit Icon */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

        {/* 🔷 Pagination */}
        <div className="pagination-container mt-4 flex justify-center gap-2">
          <button className="pagination-button px-4 py-2 rounded-lg bg-blue-600 text-white">1</button>
          <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">2</button>
          <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">3</button>
          <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">4</button>
          <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">5</button>
          <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">...</button>
          <button className="pagination-button px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">168</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;