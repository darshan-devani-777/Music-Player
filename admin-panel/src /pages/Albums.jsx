import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    releaseDate: "",
    albumImage: null,
  });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 7;

  const token = localStorage.getItem("token");

  // FETCH ALBUM
  const fetchAlbums = async () => {
    try {
      const res = await api.get("/auth/album/get-all-album", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(res.data.data);
    } catch (err) {
      alert("Failed to fetch albums");
    }
  };

  // DELETE ALBUM
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;
    try {
      await api.delete(`auth/album/delete-album/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAlbums();
    } catch (err) {
      alert("Failed to delete album");
    }
  };

  // ADD ALBUM
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("artist", formData.artist);
    data.append("releaseDate", formData.releaseDate);
    if (formData.albumImage) {
      data.append("albumImage", formData.albumImage);
    }

    try {
      if (editId) {
        await api.put(`auth/album/update-album/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post(`auth/album/create-album`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchAlbums();
      setFormData({ title: "", artist: "", releaseDate: "", albumImage: null });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      alert("Failed to save album");
    }
  };

  // EDIT ALBUM
  const openEditForm = (album) => {
    setEditId(album._id);
    setFormData({
      title: album.title,
      artist: album.artist,
      releaseDate: album.releaseDate.split("T")[0],
      albumImage: null,
    });
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ title: "", artist: "", releaseDate: "", albumImage: null });
    setShowForm(true);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // FILTER ALBUM
  const filteredAlbums = albums.filter((album) => {
    const query = searchQuery.toLowerCase();
    const releaseDateObj = new Date(album.releaseDate);
    const day = releaseDateObj.getDate().toString().padStart(2, "0");
    const month = (releaseDateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = releaseDateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return (
      album.title.toLowerCase().includes(query) ||
      album.artist.toLowerCase().includes(query) ||
      formattedDate.includes(query)
    );
  });

  const indexOfLast = currentPage * albumsPerPage;
  const indexOfFirst = indexOfLast - albumsPerPage;
  const currentAlbums = filteredAlbums.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAlbums.length / albumsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold underline">Album Management</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 cursor-pointer"
          onClick={openAddForm}
        >
          + Album
        </button>
      </div>

      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Search by title, artist, or release date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-blue-500 focus:outline-none focus:border-red-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
            <th className="p-3 border dark:border-gray-600">ID</th>
              <th className="p-3 border dark:border-gray-600">Image</th>
              <th className="p-3 border dark:border-gray-600">Title</th>
              <th className="p-3 border dark:border-gray-600">Artist</th>
              <th className="p-3 border dark:border-gray-600">Release Date</th>
              <th className="p-3 border dark:border-gray-600">No. of Images</th>
              <th className="p-3 border dark:border-gray-600">Created By</th>
              <th className="p-3 border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAlbums.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Albums Not Found.
                </td>
              </tr>
            ) : (
              currentAlbums.map((album , index) => (
                <tr
                  key={album._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                   <td className="p-3 border dark:border-gray-600 text-gray-300 text-sm">
                    {(currentPage - 1) * albumsPerPage + index + 1}.
                  </td>
                  <td className="p-3 border dark:border-gray-600">
                    {album.albumImages.length > 0 ? (
                      <img
                        src={album.albumImages[0]}
                        alt={album.title}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-white">
                    {album.title}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {album.artist}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {new Date(album.releaseDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {album.albumImages.length}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {album.createdBy?.name || "Unknown"}
                  </td>
                  <td className="p-3 border dark:border-gray-600">
                    <div className="flex gap-2 flex-nowrap">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 transition duration-300 text-sm  text-white px-3 py-1 rounded whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(album)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 transition duration-300 text-sm  text-white px-3 py-1 rounded whitespace-nowrap cursor-pointer"
                        onClick={() => handleDelete(album._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
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
                  totalPages <= 5 || isFirstTwo || isLastTwo || isNearCurrent;

                if (shouldShow) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded ${
                        isCurrent
                          ? "bg-purple-600 text-white cursor-pointer"
                          : "bg-gray-700 text-gray-300 cursor-pointer"
                      } hover:bg-purple-700 transition duration-300`}
                    >
                      {i}
                    </button>
                  );
                } else if (!leftDotsShown && i < currentPage && i > 2) {
                  pages.push(
                    <span
                      key={`dots-left-${i}`}
                      className="px-3 py-1 text-gray-500"
                    >
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
                    <span
                      key={`dots-right-${i}`}
                      className="px-3 py-1 text-gray-500"
                    >
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-96 border border-purple-800">
            <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
              {editId ? "Update Album" : "Add Album"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Artist
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.releaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, releaseDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Album Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, albumImage: e.target.files[0] })
                  }
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 cursor-pointer transition duration-300"
                >
                  {editId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer transition duration-300"
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
