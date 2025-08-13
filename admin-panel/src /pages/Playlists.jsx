import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Spinner";

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
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const playlistsPerPage = 7;
  const modalRef = useRef();

  const token = localStorage.getItem("token");

  // VALIDATION
  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.title.trim())) {
      newErrors.title = "Title can only contain alphabets and spaces.";
    } else if (!/[aeiouAEIOU]/.test(formData.title.trim())) {
      newErrors.title =
        "Title must contain at least one vowel (a, e, i, o, u).";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (formData.description.trim().length < 10) {
      newErrors.description =
        "Description must be at least 10 characters long.";
    } else if (!/^[A-Za-z\s.,!?'"]+$/.test(formData.description.trim())) {
      newErrors.description = "Description contains invalid characters.";
    } else if (!/[aeiouAEIOU]/.test(formData.description.trim())) {
      newErrors.description =
        "Description must contain at least one vowel (a, e, i, o, u).";
    }
    if (!editId && formData.playlistImage.length === 0)
      newErrors.playlistImage = "At least one image is required.";
    if (formData.selectedAlbums.length === 0)
      newErrors.selectedAlbums = "Please select at least one album.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const LOADER_DELAY = 1000;

  // FETCH PLAYLIST
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.get("auth/playlist/get-all-playlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data.data);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      toast.error("Failed to fetch playlists.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // FETCH ALBUMS
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await api.get("auth/album/get-all-album", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(res.data.data);
    } catch (err) {
      console.error("Error fetching albums:", err);
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // CREATE / EDIT PLAYLIST
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
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
        toast.success("Playlist updated successfully...");
      } else {
        await api.post("auth/playlist/create-playlist", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Playlist created successfully...");
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
      setErrors({});
    } catch (err) {
      toast.error(
        "Failed to save playlist: " +
          (err?.response?.data?.message || err.message)
      );
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // DELETE PLAYLIST
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`auth/playlist/delete-playlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        toast.success(response.data.message);
        fetchPlaylists();
      } else {
        toast.error(response.data.message || "Failed to delete playlist.");
      }
    } catch (err) {
      toast.error("Failed to delete playlist.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // OPEN EDIT FORM
  const openEditForm = (playlist) => {
    setEditId(playlist._id);
    setFormData({
      title: playlist.title,
      description: playlist.description,
      playlistImage: [], // reset file inputs on edit
      selectedAlbums: playlist.albums.map((a) => a._id),
    });

    // Set preview images from existing playlist images (assuming playlist.playlistImage is an array of URLs)
    setPreviewImages(playlist.playlistImage || []);

    setShowForm(true);
    setErrors({});
  };

  // ADD OPEN FORM
  const openAddForm = () => {
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      playlistImage: [],
      selectedAlbums: [],
    });
    setPreviewImages([]);
    setShowForm(true);
    setErrors({});
  };

  useEffect(() => {
    fetchPlaylists();
    fetchAlbums();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowForm(false);
      }
    }

    function handleEscKey(event) {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  useEffect(() => {
    return () => {
      previewImages.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [previewImages]);

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
      {/* Loader */}
      {loading && <Loader />}

      {!loading && (
        <>
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-7">
              <div className="justify-self-start">
                <h2 className="text-2xl font-sans font-semibold underline">
                  Playlist Management
                </h2>
              </div>

              <div className="justify-self-center w-full relative max-w-sm">
                <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by title, discription, or albums..."
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
                  + Playlist
                </button>
              </div>
            </div>
          </div>

          {/* Playlist Table */}
          <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="uppercase text-xs">
                <tr className="bg-gray-200 text-left text-gray-700">
                  <th className="p-3 border border-gray-300">ID</th>
                  <th className="p-3 border border-gray-300">Image</th>
                  <th className="p-3 border border-gray-300">Title</th>
                  <th className="p-3 border border-gray-300">Description</th>
                  <th className="p-3 border border-gray-300">Albums</th>
                  <th className="p-3 border border-gray-300">Created By</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPlaylists.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      Playlists Not Found.
                    </td>
                  </tr>
                ) : (
                  currentPlaylists.map((playlist, index) => (
                    <tr
                      key={playlist._id}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {(currentPage - 1) * playlistsPerPage + index + 1}.
                      </td>
                      <td className="p-3 border border-gray-300">
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
                      <td className="p-3 border border-gray-300 text-gray-900">
                        {playlist.title || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {playlist.description || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {playlist.albums.map((a) => a.title).join(", ") ||
                          "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {playlist.createdBy?.name || "Unknown"}
                      </td>
                      <td className="p-3 border border-gray-300 space-x-2">
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
                      totalPages <= 4 ||
                      isFirstTwo ||
                      isLastTwo ||
                      isNearCurrent;

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
                        <span
                          key={`dots-left`}
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
              <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg shadow-lg w-96 border border-purple-500"
              >
                <h2 className="text-2xl font-semibold mb-4 text-center text-purple-600 underline">
                  {editId ? "Update Playlist" : "Add Playlist"}
                </h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold">Title</label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded text-sm border-gray-500 text-gray-500 hover:border-purple-300"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs">{errors.title}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold">
                      Description
                    </label>
                    <textarea
                      className="w-full border px-3 py-2 rounded text-sm border-gray-500 text-gray-500 hover:border-purple-300"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-xs">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold">Image</label>
                    <input
                      type="file"
                      className="w-full border px-3 py-2 rounded text-sm cursor-pointer border-gray-500 text-gray-500 hover:border-purple-300"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setFormData({ ...formData, playlistImage: files });

                        const filePreviews = files.map((file) =>
                          URL.createObjectURL(file)
                        );
                        setPreviewImages(filePreviews);
                      }}
                    />
                    {errors.playlistImage && (
                      <p className="text-red-500 text-xs">
                        {errors.playlistImage}
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

                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-black font-semibold">
                      Select Album
                    </label>
                    <select
                      value={formData.albumId}
                      onChange={(e) =>
                        setFormData({ ...formData, albumId: e.target.value })
                      }
                      className={`w-full border px-3 py-2 rounded text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm cursor-pointer hover:border-purple-300 ${
                        errors.albumId ? "border-red-500" : "border-gray-500"
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
        </>
      )}
    </div>
  );
}
