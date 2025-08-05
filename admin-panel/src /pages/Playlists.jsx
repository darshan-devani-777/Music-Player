import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    playlistImage: [],
    selectedAlbums: [],
  });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const playlistsPerPage = 7;

  const token = localStorage.getItem("token");

  // FETCH PLAYLIST
  const fetchPlaylists = async () => {
    try {
      const res = await api.get("auth/playlist/get-all-playlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data.data);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      alert("Failed to fetch playlists");
    }
  };

  // FETCH ALBUMS
  const fetchAlbums = async () => {
    try {
      const res = await api.get("auth/album/get-all-album", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(res.data.data);
    } catch (err) {
      console.error("Error fetching albums:", err);
    }
  };

  // FORM SUBMIT
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);

    for (let albumId of formData.selectedAlbums) {
      data.append("albums", albumId);
    }

    for (let i = 0; i < formData.playlistImage.length; i++) {
      data.append("playlistImage", formData.playlistImage[i]);
    }

    try {
      if (editId) {
        await api.put(`auth/playlist/update-playlist/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("auth/playlist/create-playlist", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchPlaylists();
      setFormData({
        title: "",
        description: "",
        playlistImage: [],
        selectedAlbums: [],
      });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || JSON.stringify(err);
      alert("Failed to save playlist: " + msg);
    }
  };

  // EDIT FORM
  const openEditForm = (playlist) => {
    setEditId(playlist._id);
    setFormData({
      title: playlist.title,
      description: playlist.description,
      playlistImage: [],
      selectedAlbums: playlist.albums.map((a) => a._id),
    });
    setShowForm(true);
  };

  // DELETE PLAYLIST
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;
    try {
      await api.delete(`auth/playlist/delete-playlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
    } catch (err) {
      alert("Failed to delete playlist");
    }
  };

  // ADD PLAYLIST
  const openAddForm = () => {
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      playlistImage: [],
      selectedAlbums: [],
    });
    setShowForm(true);
  };

  useEffect(() => {
    fetchPlaylists();
    fetchAlbums();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // FILTER PLAYLIST
  const filteredPlaylists = playlists.filter((playlist) => {
    const query = searchQuery.toLowerCase();
    return (
      playlist.title.toLowerCase().includes(query) ||
      playlist.description.toLowerCase().includes(query) ||
      playlist.albums.some((album) => album.title.toLowerCase().includes(query))
    );
  });

  const indexOfLast = currentPage * playlistsPerPage;
  const indexOfFirst = indexOfLast - playlistsPerPage;
  const currentPlaylists = filteredPlaylists.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPlaylists.length / playlistsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold underline">
          Playlist Management
        </h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 cursor-pointer"
          onClick={openAddForm}
        >
          + Playlist
        </button>
      </div>

      <div className="mb-5 text-center">
        <input
          type="text"
          placeholder="Search by title, description, or album title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-blue-500 focus:outline-none focus:border-red-400 !placeholder-gray-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
              <th className="p-3 border dark:border-gray-600">ID</th>
              <th className="p-3 border dark:border-gray-600">Image</th>
              <th className="p-3 border dark:border-gray-600">Title</th>
              <th className="p-3 border dark:border-gray-600">Description</th>
              <th className="p-3 border dark:border-gray-600">Albums</th>
              <th className="p-3 border dark:border-gray-600">Created By</th>
              <th className="p-3 border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPlaylists.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Playlists Not Found.
                </td>
              </tr>
            ) : (
              currentPlaylists.map((playlist, index) => (
                <tr
                  key={playlist._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="p-3 border dark:border-gray-600 text-gray-300 text-sm">
                    {(currentPage - 1) * playlistsPerPage + index + 1}.
                  </td>{" "}
                  <td className="p-3 border dark:border-gray-600">
                    {playlist.playlistImage.length > 0 ? (
                      <img
                        src={playlist.playlistImage[0]}
                        alt={playlist.title}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-white">
                    {playlist.title || "N/A" }
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {playlist.description || "N/A" }
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {playlist.albums.map((a) => a.title).join(", ") || "N/A" }
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {playlist.createdBy?.name || "Unknown"}
                  </td>
                  <td className="p-3 border dark:border-gray-600 space-x-2">
                    <button
                      className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition duration-300 cursor-pointer"
                      onClick={() => openEditForm(playlist)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition duration-300 cursor-pointer"
                      onClick={() => handleDelete(playlist._id)}
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
                          : "bg-gray-700 text-gray-300 cursor-pointer transition duration-300"
                      } hover:bg-purple-700 transition`}
                    >
                      {i}
                    </button>
                  );
                } else if (!leftDotsShown && i < currentPage && i > 2) {
                  pages.push(
                    <span key={`dots-left`} className="px-3 py-1 text-gray-500">
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
                      key={`dots-right`}
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

      {/* Playlist Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 border border-purple-500">
          <h2 className="text-2xl font-semibold mb-4 text-center text-purple-600 underline">
            {editId ? "Update Playlist" : "Add Playlist"}
          </h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">
                Title
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
      
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">
                Description
              </label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              ></textarea>
            </div>
      
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">
                Image
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                name="playlistImage"
                className="w-full border px-3 py-2 rounded hover:border-purple-400 transition duration-300 cursor-pointer"
                onChange={(e) =>
                  setFormData({ ...formData, playlistImage: e.target.files })
                }
              />
            </div>
      
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">
                Select Albums
              </label>
              <select
                multiple
                className="w-full border px-3 py-2 rounded"
                value={formData.selectedAlbums}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedAlbums: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
              >
                {albums.map((album) => (
                  <option key={album._id} value={album._id}>
                    {album.title}
                  </option>
                ))}
              </select>
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
