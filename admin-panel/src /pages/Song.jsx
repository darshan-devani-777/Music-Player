import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    fileUrl: "",
    songImageFiles: [],
    artistId: "",
    albumId: "",
    genreId: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 7;
  const token = localStorage.getItem("token");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required.";
    if (!formData.fileUrl.trim())
      newErrors.fileUrl = "Audio File URL is required.";
    if (!formData.artistId.trim())
      newErrors.artistId = "Artist ID is required.";
    if (!formData.albumId.trim()) newErrors.albumId = "Album ID is required.";
    if (!formData.genreId.trim()) newErrors.genreId = "Genre ID is required.";

    if (
      !editId &&
      (!formData.songImageFiles || formData.songImageFiles.length === 0)
    ) {
      newErrors.songImage = "At least one song image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FETCH SONG
  const fetchSongs = async () => {
    try {
      const res = await api.get("auth/song/get-all-song", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(res.data.data);
    } catch {
      toast.error("Failed to fetch songs.");
    }
  };

  // CREATE / EDIT SONG
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("duration", formData.duration);
      fd.append("fileUrl", formData.fileUrl);
      fd.append("artistId", formData.artistId);
      fd.append("albumId", formData.albumId);
      fd.append("genreId", formData.genreId);

      (formData.songImageFiles || []).forEach((file) => {
        fd.append("songImage", file);
      });

      if (editId) {
        await api.put(`auth/song/update-song/${editId}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Song updated successfully...");
      } else {
        await api.post("auth/song/create-song", fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Song created successfully...");
      }

      fetchSongs();

      setFormData({
        title: "",
        duration: "",
        fileUrl: "",
        songImageFiles: [],
        artistId: "",
        albumId: "",
        genreId: "",
      });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error details:", err);

      const errorMessage =
        err?.response?.data?.message || err.message || "Unknown error";

      toast.error("Failed to save song: " + errorMessage);
    }
  };

  // FILE INPUT CHANGE 
  const handleSongImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      songImageFiles: files,
    }));
  };

  // open edit form
  const openAddForm = (song) => {
    setEditId(song._id);
    setFormData({
      title: song.title,
      duration: song.duration,
      fileUrl: song.cloudinaryUrl || "",
      songImageFiles: [], // empty here; edit images handling is more complex, usually done separately
      artistId: song.artistId?._id || "",
      albumId: song.albumId?._id || "",
      genreId: song.genreId?._id || "",
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
      songImage: song.songImage?.length ? song.songImage : [""],
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
      toast.success("Song deleted successfully...");
      fetchSongs();
    } catch {
      toast.error("Failed to delete song.");
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-7">
          <div className="justify-self-start">
            <h2 className="text-2xl font-sans font-semibold underline">
              Song Management
            </h2>
          </div>

          <div className="justify-self-center w-full relative max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by title, artist, album, or genre..."
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
              + Song
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-200 text-left text-gray-700">
              <th className="p-3 border border-gray-300">ID</th>
              <th className="p-3 border border-gray-300">Image</th>
              <th className="p-3 border border-gray-300">Title</th>
              <th className="p-3 border border-gray-300">Duration</th>
              <th className="p-3 border border-gray-300">Artist</th>
              <th className="p-3 border border-gray-300">Album</th>
              <th className="p-3 border border-gray-300">Genre</th>
              <th className="p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSongs.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Songs Not Found.
                </td>
              </tr>
            ) : (
              currentSongs.map((song, index) => (
                <tr key={song._id} className="hover:bg-gray-100 cursor-pointer">
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {(currentPage - 1) * songsPerPage + index + 1}.
                  </td>
                  <td className="p-3 border border-gray-300">
                    {song.songImage?.[0] ? (
                      <img
                        src={song.songImage[0]}
                        alt="cover"
                        className="w-16 h-16 object-cover border rounded"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-900">
                    {song.title || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {song.duration || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {song.artistId?.name || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {song.albumId?.title || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {song.genreId?.name || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 space-x-2">
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
      </div>

      {/* Pagination */}
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

              const showPage =
                totalPages <= 4 || isFirstTwo || isLastTwo || isNearCurrent;

              if (showPage) {
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
                  <span key={`dots-left`} className="px-2 text-gray-500">
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
                  <span key={`dots-right`} className="px-2 text-gray-500">
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

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 max-h-[90vh] overflow-y-auto border border-purple-500 scrollbar-hide">
            <h2 className="text-2xl font-semibold text-center text-purple-500 underline">
              {editId ? "Update Song" : "Add Song"}
            </h2>

            <form onSubmit={handleFormSubmit}>
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Artist ID */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Artist ID
                </label>
                <input
                  type="text"
                  value={formData.artistId}
                  onChange={(e) =>
                    setFormData({ ...formData, artistId: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm ${
                    errors.artistId ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.artistId && (
                  <p className="text-red-500 text-xs mt-1">{errors.artistId}</p>
                )}
              </div>

              {/* Album ID */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Album ID
                </label>
                <input
                  type="text"
                  value={formData.albumId}
                  onChange={(e) =>
                    setFormData({ ...formData, albumId: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm ${
                    errors.albumId ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.albumId && (
                  <p className="text-red-500 text-xs mt-1">{errors.albumId}</p>
                )}
              </div>

              {/* Genre ID */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Genre ID
                </label>
                <input
                  type="text"
                  value={formData.genreId}
                  onChange={(e) =>
                    setFormData({ ...formData, genreId: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm ${
                    errors.genreId ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.genreId && (
                  <p className="text-red-500 text-xs mt-1">{errors.genreId}</p>
                )}
              </div>

              {/* Audio File URL */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Audio File URL
                </label>
                <input
                  type="text"
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm ${
                    errors.fileUrl ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.fileUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.fileUrl}</p>
                )}
              </div>

              {/* Song Image Upload */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-black font-semibold">
                  Upload Song Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="w-full border px-3 py-2 rounded text-gray-500 bg-white cursor-pointer hover:border-purple-400 transition duration-300 text-sm"
                  onChange={handleSongImageChange}
                />
                {errors.songImage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.songImage}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 cursor-pointer text-sm"
                >
                  {editId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 cursor-pointer text-sm"
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
