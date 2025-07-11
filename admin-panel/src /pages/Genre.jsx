import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genreImage: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const genresPerPage = 7;

  const token = localStorage.getItem("token");

  // FETCH GENRE
  const fetchGenres = async () => {
    try {
      const res = await api.get("auth/genre/get-all-genre", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(res.data.data);
    } catch (err) {
      console.error("Error fetching genres:", err);
      alert("Failed to fetch genres");
    }
  };

  // EDIT GENRE
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    for (let i = 0; i < formData.genreImage.length; i++) {
      data.append("genreImage", formData.genreImage[i]);
    }

    try {
      if (editId) {
        await api.put(`auth/genre/update-genre/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("auth/genre/create-genre", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchGenres();
      setFormData({ name: "", description: "", genreImage: [] });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      alert("Failed to save genre: " + msg);
    }
  };

  // OPEN FORM
  const openEditForm = (genre) => {
    setEditId(genre._id);
    setFormData({
      name: genre.name,
      description: genre.description,
      genreImage: [],
    });
    setShowForm(true);
  };

  // DELETE GENRE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;
    try {
      await api.delete(`auth/genre/delete-genre/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGenres();
    } catch (err) {
      alert("Failed to delete genre");
    }
  };

  // CREATE GENRE
  const openAddForm = () => {
    setEditId(null);
    setFormData({ name: "", description: "", genreImage: [] });
    setShowForm(true);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // FILTER GENRE
  const filteredGenres = genres.filter((genre) => {
    const query = searchQuery.toLowerCase();
    return (
      genre.name.toLowerCase().includes(query) ||
      genre.description.toLowerCase().includes(query)
    );
  });

  const indexOfLast = currentPage * genresPerPage;
  const indexOfFirst = indexOfLast - genresPerPage;
  const currentGenres = filteredGenres.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredGenres.length / genresPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold underline">
          Genre Management
        </h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 cursor-pointer"
          onClick={openAddForm}
        >
          + Genre
        </button>
      </div>
  
      <div className="mb-5 text-center">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-blue-500 focus:outline-none focus:border-red-400"
        />
      </div>
  
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
              <th className="p-3 border dark:border-gray-600">Image</th>
              <th className="p-3 border dark:border-gray-600">Name</th>
              <th className="p-3 border dark:border-gray-600">Description</th>
              <th className="p-3 border dark:border-gray-600">Created By</th>
              <th className="p-3 border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentGenres.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Genres Not Found.
                </td>
              </tr>
            ) : (
              currentGenres.map((genre) => (
                <tr
                  key={genre._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="p-3 border dark:border-gray-600">
                    {genre.genreImage?.[0] ? (
                      <img
                        src={genre.genreImage[0]}
                        alt={genre.name}
                        className="w-16 h-16 object-cover border rounded"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-white">
                    {genre.name}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {genre.description}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {genre.createdBy?.name || "Unknown"}
                  </td>
                  <td className="p-3 border dark:border-gray-600 space-x-2">
                    <button
                      className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition duration-300 cursor-pointer"
                      onClick={() => openEditForm(genre)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition duration-300 cursor-pointer"
                      onClick={() => handleDelete(genre._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
  
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-purple-600 text-white cursor-pointer transition duration-300"
                    : "bg-gray-700 text-gray-300 cursor-pointer transition duration-300"
                } hover:bg-purple-700 transition`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
  
      {/* Genre Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-96 border border-purple-800">
            <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
              {editId ? "Update Genre" : "Add Genre"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                  Image
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  name="genreImage"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, genreImage: e.target.files })
                  }
                />
              </div>
  
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 cursor-pointer"
                >
                  {editId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 cursor-pointer"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );  
}
