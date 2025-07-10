import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    fileUrl: "",
    artistId: "",
    albumId: "",
    genreId: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 7;
  const token = localStorage.getItem("token");

  // FETCH SONG
  const fetchSongs = async () => {
    try {
      const res = await api.get("auth/song/get-all-song", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(res.data.data);
    } catch (err) {
      alert("Failed to fetch songs");
    }
  };

  // EDIT/DELETE SONG
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      title: formData.title,
      duration: formData.duration,
      cloudinaryUrl: formData.fileUrl,
      artistId: formData.artistId,
      albumId: formData.albumId,
      genreId: formData.genreId,
    };

    try {
      if (editId) {
        await api.put(`auth/song/update-song/${editId}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post("auth/song/create-song", updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      fetchSongs();
      setFormData({
        title: "",
        duration: "",
        fileUrl: "",
        artistId: "",
        albumId: "",
        genreId: "",
      });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      alert("Failed to save song: " + err?.response?.data?.message);
    }
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setEditId(null);
    setFormData({
      title: "",
      duration: "",
      fileUrl: [],
      artistId: "",
      albumId: "",
      genreId: "",
    });
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (song) => {
    setEditId(song._id);
    setFormData({
      title: song.title,
      duration: song.duration,
      fileUrl: song.cloudinaryUrl || "",
      artistId: song.artistId?._id || "",
      albumId: song.albumId?._id || "",
      genreId: song.genreId?._id || "",
    });
    setShowForm(true);
  };

  // DELETE SONG
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      await api.delete(`auth/song/delete-song/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSongs();
    } catch {
      alert("Failed to delete song");
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // FILTER SONG
  const filteredSongs = songs.filter((song) => {
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artistId?.name?.toLowerCase().includes(query)
    );
  });

  const indexOfLast = currentPage * songsPerPage;
  const indexOfFirst = indexOfLast - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold underline">Song Management</h2>
        <button
          onClick={openAddForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 cursor-pointer"
        >
          + Song
        </button>
      </div>

      <div className="mb-5 text-center">
        <input
          type="text"
          placeholder="Search by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-blue-500 focus:outline-none focus:border-red-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
              <th className="p-3 border dark:border-gray-600">Title</th>
              <th className="p-3 border dark:border-gray-600">Duration</th>
              <th className="p-3 border dark:border-gray-600">Artist</th>
              <th className="p-3 border dark:border-gray-600">Album</th>
              <th className="p-3 border dark:border-gray-600">Genre</th>
              <th className="p-3 border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSongs.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Songs Not Found.
                </td>
              </tr>
            ) : (
              currentSongs.map((song) => (
                <tr
                  key={song._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="p-3 border dark:border-gray-600 text-white">
                    {song.title}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {song.duration}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {song.artistId?.name}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {song.albumId?.title}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {song.genreId?.name}
                  </td>
                  <td className="p-3 border dark:border-gray-600 space-x-2">
                    <button
                      onClick={() => openEditForm(song)}
                      className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition duration-300 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(song._id)}
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition duration-300 cursor-pointer"
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
                } hover:bg-purple-700`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🎵 Song Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-96 border border-purple-800">
            <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
              {editId ? "Update Song" : "Add Song"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              {["title", "duration", "artistId", "albumId", "genreId"].map(
                (field) => (
                  <div key={field} className="mb-3">
                    <label className="block text-sm mb-1 capitalize text-gray-600 dark:text-gray-300">
                      {field.replace("Id", " ID")}
                    </label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      required
                      className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                )
              )}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                  Audio File URL
                </label>
                <input
                  type="text"
                  placeholder="Paste audio file URL (e.g., https://...)"
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  required
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
