import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Spinner";

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const modalRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch Artists
    api
      .get("auth/artist/get-all-artist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArtists(res.data.data))
      .catch(() => toast.error("Failed to fetch artists"));

    // Fetch Albums
    api
      .get("auth/album/get-all-album", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAlbums(res.data.data))
      .catch(() => toast.error("Failed to fetch albums"));

    // Fetch Genres
    api
      .get("auth/genre/get-all-genre", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGenres(res.data.data))
      .catch(() => toast.error("Failed to fetch genres"));
  }, [token]);

  const validateForm = () => {
    const newErrors = {};

    const titleValue = formData.title || "";
    const durationValue = formData.duration || "";
    const fileUrlValue = formData.fileUrl || "";
    const artistIdValue = formData.artistId || "";
    const albumIdValue = formData.albumId || "";
    const genreIdValue = formData.genreId || "";

    if (!titleValue.trim()) {
      newErrors.title = "Title is required.";
    } else if (titleValue.trim().length > 15) {
      newErrors.title = "Title cannot be more than 15 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(titleValue.trim())) {
      newErrors.title = "Title can only contain alphabets and spaces.";
    } else if (!/[aeiouAEIOU]/.test(titleValue.trim())) {
      newErrors.title = "Title must contain at least one vowel (a, e, i, o, u).";
    }    

    if (!durationValue.trim()) {
      newErrors.duration = "Duration is required.";
    } else {
      const durationRegex = /^\d{1,2}:[0-5][0-9]$/;
      const trimmedDuration = durationValue.trim();
    
      if (!durationRegex.test(trimmedDuration)) {
        newErrors.duration = "Duration must be in MM:SS format (e.g., 2:20).";
      } else {
        const [minutes, seconds] = trimmedDuration.split(":").map(Number);
        if (minutes > 99) {
          newErrors.duration = "Duration cannot exceed 99 minutes.";
        }
      }
    }    

    if (!fileUrlValue.trim()) newErrors.fileUrl = "Audio File URL is required.";
    if (!artistIdValue.trim()) newErrors.artistId = "Artist ID is required.";
    if (!albumIdValue.trim()) newErrors.albumId = "Album ID is required.";
    if (!genreIdValue.trim()) newErrors.genreId = "Genre ID is required.";

    if (
      !editId &&
      (!formData.songImageFiles || formData.songImageFiles.length === 0)
    ) {
      newErrors.songImage = "At least one song image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const LOADER_DELAY = 1000;

  // FETCH SONG
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await api.get("auth/song/get-all-song", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch songs.");
      console.error("Error fetching songs:", err);
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // CREATE / EDIT SONG
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
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
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // DELETE SONG
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    setLoading(true);
    try {
      await api.delete(`auth/song/delete-song/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Song deleted successfully...");
      fetchSongs();
    } catch (err) {
      console.error("Error deleting song:", err);
      toast.error("Failed to delete song.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // FILE INPUT CHANGE
  const handleSongImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      songImageFiles: files,
    }));

    if (editId) {
      const filePreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages(filePreviews);
    }
  };

  // OPEN EDIT FORM
  const openAddForm = (song) => {
    setEditId(song._id);
    setFormData({
      title: song.title,
      duration: song.duration,
      fileUrl: song.cloudinaryUrl || "",
      songImageFiles: [],
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
      songImageFiles: [], // new files selected by user
      artistId: song.artistId?._id || "",
      albumId: song.albumId?._id || "",
      genreId: song.genreId?._id || "",
    });
    setPreviewImages(song.songImage || []); // show existing images
    setShowForm(true);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowForm(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

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
      {/* Loader */}
      {loading && <Loader />}

      {!loading && (
        <>
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
                    <tr
                      key={song._id}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
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
              <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg shadow-md w-96 max-h-[90vh] overflow-y-auto border border-purple-500 scrollbar-hide"
              >
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
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm hover:border-purple-300 ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title}
                      </p>
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
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm hover:border-purple-300 ${
                        errors.duration ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  {/* Artist Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-black font-semibold">
                      Artist
                    </label>
                    <select
                      value={formData.artistId}
                      onChange={(e) =>
                        setFormData({ ...formData, artistId: e.target.value })
                      }
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm cursor-pointer hover:border-purple-300 ${
                        errors.artistId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Artist</option>
                      {artists.map((artist) => (
                        <option key={artist._id} value={artist._id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                    {errors.artistId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.artistId}
                      </p>
                    )}
                  </div>

                  {/* Album Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-black font-semibold">
                      Album
                    </label>
                    <select
                      value={formData.albumId}
                      onChange={(e) =>
                        setFormData({ ...formData, albumId: e.target.value })
                      }
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm cursor-pointer hover:border-purple-300 ${
                        errors.albumId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Album</option>
                      {albums.map((album) => (
                        <option key={album._id} value={album._id}>
                          {album.title}
                        </option>
                      ))}
                    </select>
                    {errors.albumId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.albumId}
                      </p>
                    )}
                  </div>

                  {/* Genre Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-black font-semibold">
                      Genre
                    </label>
                    <select
                      value={formData.genreId}
                      onChange={(e) =>
                        setFormData({ ...formData, genreId: e.target.value })
                      }
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm cursor-pointer hover:border-purple-300 ${
                        errors.genreId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Genre</option>
                      {genres.map((genre) => (
                        <option key={genre._id} value={genre._id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    {errors.genreId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.genreId}
                      </p>
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
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm hover:border-purple-300 ${
                        errors.fileUrl ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.fileUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fileUrl}
                      </p>
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
                    {editId && previewImages.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2 mt-2">
                        {previewImages.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`Preview ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
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
        </>
      )}
    </div>
  );
}
