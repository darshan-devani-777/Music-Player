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
    songImage: [""],
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
    } catch {
      alert("Failed to fetch songs");
    }
  };

  // UPDATE / CREATE SONG
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      title: formData.title,
      duration: formData.duration,
      cloudinaryUrl: formData.fileUrl,
      songImage: formData.songImage,
      artistId: formData.artistId,
      albumId: formData.albumId,
      genreId: formData.genreId,
    };
    try {
      if (editId) {
        await api.put(`auth/song/update-song/${editId}`, updatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("auth/song/create-song", updatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchSongs();
      setFormData({
        title: "",
        duration: "",
        fileUrl: "",
        songImage: [""],
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
      fileUrl: "",
      songImage: [""],
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
      {/* Header & Search */}
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
          className="w-full max-w-md px-4 py-2 text-sm border rounded dark:bg-gray-800 dark:border-blue-500 focus:outline-none focus:border-red-400  !placeholder-gray-300"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
              <th className="p-3 border dark:border-gray-600">ID</th>
              <th className="p-3 border dark:border-gray-600">Image</th>
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
                  colSpan="7"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Songs Not Found.
                </td>
              </tr>
            ) : (
              currentSongs.map((song, index) => (
                <tr
                  key={song._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="p-3 border dark:border-gray-600 text-gray-300 text-sm">
                    {(currentPage - 1) * songsPerPage + index + 1}.
                  </td>
                  <td className="p-3 border dark:border-gray-600">
                    {song.songImage?.[0] && (
                      <img
                        src={song.songImage[0]}
                        alt="cover"
                        className="w-16 h-16 object-cover border rounded"
                      />
                    )}
                  </td>
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
              <label className="block text-sm mb-1 text-black font-semibold">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
      
            {/* Duration */}
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
      
            {/* Artist ID */}
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">Artist ID</label>
              <input
                type="text"
                value={formData.artistId}
                onChange={(e) =>
                  setFormData({ ...formData, artistId: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
      
            {/* Album ID */}
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">Album ID</label>
              <input
                type="text"
                value={formData.albumId}
                onChange={(e) =>
                  setFormData({ ...formData, albumId: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
      
            {/* Genre ID */}
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">Genre ID</label>
              <input
                type="text"
                value={formData.genreId}
                onChange={(e) =>
                  setFormData({ ...formData, genreId: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
      
            {/* Audio File URL */}
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">Audio File URL</label>
              <input
                type="text"
                value={formData.fileUrl}
                onChange={(e) =>
                  setFormData({ ...formData, fileUrl: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
      
            {/* Song Image Upload */}
            <div className="mb-4">
              <label className="block text-sm mb-1 text-black font-semibold">Upload Song Image</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full border px-3 py-2 rounded text-black bg-white cursor-pointer hover:border-purple-400 transition duration-300"
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  const uploadedUrls = [];
      
                  for (let file of files) {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("upload_preset", "your_upload_preset");
                    fd.append("folder", "music-app/songs/images");
      
                    try {
                      const res = await fetch(
                        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
                        { method: "POST", body: fd }
                      );
                      const data = await res.json();
                      uploadedUrls.push(data.secure_url);
                    } catch (err) {
                      alert("Image upload failed");
                    }
                  }
      
                  setFormData((prev) => ({
                    ...prev,
                    songImage: [...prev.songImage, ...uploadedUrls],
                  }));
                }}
              />
            </div>
      
            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 cursor-pointer"
              >
                {editId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 cursor-pointer"
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
