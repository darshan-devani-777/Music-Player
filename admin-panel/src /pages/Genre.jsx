import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }
    if (!editId && formData.genreImage.length === 0) {
      newErrors.genreImage = "At least one image is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // FETCH GENRE
  const fetchGenres = async () => {
    try {
      const res = await api.get("auth/genre/get-all-genre", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(res.data.data);
    } catch (err) {
      console.error("Error fetching genres:", err);
      toast.error("Failed to fetch genres.");
    }
  };

  // CREATE / EDIT GENRE
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // If validation fails, stop submitting
      return;
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("description", formData.description.trim());

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
        toast.success("Genre updated successfully...");
      } else {
        await api.post("auth/genre/create-genre", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Genre created successfully...");
      }

      fetchGenres();
      setFormData({ name: "", description: "", genreImage: [] });
      setEditId(null);
      setShowForm(false);
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      toast.error("Failed to save genre: " + msg);
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
      toast.success("Genre deleted successfully...");
      fetchGenres();
    } catch (err) {
      toast.error("Failed to delete genre.");
    }
  };

  // OPEN ADD FORM
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
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-7">
          <div className="justify-self-start">
            <h2 className="text-2xl font-sans font-semibold underline">
              Genre Management
            </h2>
          </div>

          <div className="justify-self-center w-full relative max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-purple-400 !placeholder:text-gray-100"
            />
          </div>

          <div className="justify-self-end">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 cursor-pointer text-sm"
              onClick={openAddForm}
            >
              + Genre
            </button>
          </div>
        </div>
      </div>

      {/* Genre Table */}
      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-200 text-left text-gray-700">
              <th className="p-3 border border-gray-300">ID</th>
              <th className="p-3 border border-gray-300">Image</th>
              <th className="p-3 border border-gray-300">Name</th>
              <th className="p-3 border border-gray-300">Description</th>
              <th className="p-3 border border-gray-300">Created By</th>
              <th className="p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentGenres.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Genres Not Found.
                </td>
              </tr>
            ) : (
              currentGenres.map((genre, index) => (
                <tr
                  key={genre._id}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {(currentPage - 1) * genresPerPage + index + 1}.
                  </td>
                  <td className="p-3 border border-gray-300">
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
                  <td className="p-3 border border-gray-300 text-gray-900">
                    {genre.name || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {genre.description || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {genre.createdBy?.name || "Unknown"}
                  </td>
                  <td className="p-3 border border-gray-300 space-x-2">
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
            {(() => {
              const pages = [];
              let leftDotsShown = false;
              let rightDotsShown = false;

              for (let i = 1; i <= totalPages; i++) {
                const isCurrent = currentPage === i;
                const isFirstTwo = i === 1 || i === 2;
                const isLastTwo = i === totalPages || i === totalPages - 1;
                const isNearCurrent = Math.abs(currentPage - i) <= 1;

                const shouldShow =
                  totalPages <= 4 || isFirstTwo || isLastTwo || isNearCurrent;

                if (shouldShow) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded ${
                        isCurrent
                          ? "bg-purple-600 text-white cursor-pointer transition duration-300"
                          : "bg-gray-300 text-gray-800 cursor-pointer transition duration-300"
                      } hover:bg-purple-700 transition`}
                    >
                      {i}
                    </button>
                  );
                } else if (!leftDotsShown && i < currentPage && i > 2) {
                  pages.push(
                    <span key="left-dots" className="px-3 py-1 text-gray-500">
                      ...
                    </span>
                  );
                  leftDotsShown = true;
                } else if (
                  !rightDotsShown &&
                  i > currentPage &&
                  i < totalPages - 1
                ) {
                  pages.push(
                    <span key="right-dots" className="px-3 py-1 text-gray-500">
                      ...
                    </span>
                  );
                  rightDotsShown = true;
                }
              }

              return pages;
            })()}
          </div>
        )}
      </div>

      {/* Genre Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 border border-purple-500">
            <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
              {editId ? "Update Genre" : "Add Genre"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  className={`w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm hover:border-purple-400 transition duration-300 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Description
                </label>
                <textarea
                  className={`w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm hover:border-purple-400 transition duration-300 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Image
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  name="genreImage"
                  className={`w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm hover:border-purple-400 transition duration-300 cursor-pointer ${
                    errors.genreImage ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={(e) =>
                    setFormData({ ...formData, genreImage: e.target.files })
                  }
                />
                {errors.genreImage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.genreImage}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 cursor-pointer text-sm"
                >
                  {editId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 cursor-pointer text-sm"
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
