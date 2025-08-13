import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Spinner";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    releaseDate: "",
    albumImage: null,
  });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 7;
  const albumFormRef = useRef();

  const token = localStorage.getItem("token");
  const isEditMode = Boolean(editingAlbumId);

  const validateForm = () => {
    const newErrors = {};
    const isEditMode = Boolean(editId);

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (!/^[A-Za-z0-9\s]+$/.test(formData.title.trim())) {
      newErrors.title =
        "Title can only contain alphabets, numbers, and spaces.";
    } else if (!/[aeiouAEIOU]/.test(formData.title.trim())) {
      newErrors.title =
        "Title must contain at least one vowel (a, e, i, o, u).";
    }

    if (!isEditMode && (!formData.artistId || formData.artistId === "")) {
      newErrors.artistId = "Artist is required.";
    }

    if (!isEditMode && !formData.releaseDate) {
      newErrors.releaseDate = "Release date is required.";
    }

    if (!isEditMode && !formData.albumImage) {
      newErrors.albumImage = "Album image is required.";
    }

    return newErrors;
  };

    const LOADER_DELAY = 1000;

  // FETCH ALBUMS
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/album/get-all-album", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch albums.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // FETCH ARTISTS
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/artist/get-all-artist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch artists.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // DELETE ALBUM
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;

    try {
      setLoading(true);
      await api.delete(`auth/album/delete-album/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Album deleted successfully...");
      fetchAlbums();
    } catch (err) {
      toast.error("Failed to delete album.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // CREATE / EDIT ALBUM
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isEditMode = Boolean(editId);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const data = new FormData();
    data.append("title", formData.title);

    if (!isEditMode || formData.artistId)
      data.append("artistId", formData.artistId);
    if (!isEditMode || formData.releaseDate)
      data.append("releaseDate", formData.releaseDate);
    if (formData.albumImage) data.append("albumImage", formData.albumImage);

    try {
      setLoading(true);
      if (isEditMode) {
        await api.put(`/auth/album/update-album/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Album updated successfully...");
      } else {
        await api.post(`/auth/album/create-album`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Album created successfully...");
      }

      fetchAlbums();

      setFormData({
        title: "",
        artistId: "",
        releaseDate: "",
        albumImage: null,
      });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save album.";
      toast.error(msg);
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setEditId(null);
    setFormData({ title: "", artist: "", releaseDate: "", albumImage: null });
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (album) => {
    setEditId(album._id);
    setFormData({
      title: album.title,
      artistId: album.artistId?._id || "",
      releaseDate: album.releaseDate ? album.releaseDate.split("T")[0] : "",
      albumImage: null,
    });

    if (album.albumImages && album.albumImages.length > 0) {
      setPreviewImage(album.albumImages[0]);
    } else {
      setPreviewImage("");
    }

    setShowForm(true);
  };

  useEffect(() => {
    if (!showForm) {
      setPreviewImage("");
      setFormData({
        title: "",
        artistId: "",
        releaseDate: "",
        albumImage: null,
      });
      setFormErrors({});
      setEditId(null);
    }
  }, [showForm]);

  useEffect(() => {
    fetchAlbums();
    fetchArtists();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        albumFormRef.current &&
        !albumFormRef.current.contains(event.target)
      ) {
        setShowForm(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
      album.artistId?.name.toLowerCase().includes(query) ||
      formattedDate.includes(query)
    );
  });

  const indexOfLast = currentPage * albumsPerPage;
  const indexOfFirst = indexOfLast - albumsPerPage;
  const currentAlbums = filteredAlbums.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAlbums.length / albumsPerPage);

  return (
    <div>
      {/* Loader */}
      {loading && <Loader />}
      {!loading && (
        <>
          {/* HEADER */}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-7">
              <div className="justify-self-start">
                <h2 className="text-2xl font-sans font-semibold underline">
                  Album Management
                </h2>
              </div>

              <div className="justify-self-center w-full relative max-w-sm">
                <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by title, artist, or release date..."
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
                  + Album
                </button>
              </div>
            </div>
          </div>

          {/* Album Table */}
          <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="uppercase text-xs">
                <tr className="bg-gray-200 text-left text-gray-700">
                  <th className="p-3 border border-gray-300">ID</th>
                  <th className="p-3 border border-gray-300">Image</th>
                  <th className="p-3 border border-gray-300">Title</th>
                  <th className="p-3 border border-gray-300">Artist</th>
                  <th className="p-3 border border-gray-300">Release Date</th>
                  <th className="p-3 border border-gray-300">No. of Images</th>
                  <th className="p-3 border border-gray-300">Created By</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAlbums.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      Albums Not Found.
                    </td>
                  </tr>
                ) : (
                  currentAlbums.map((album, index) => (
                    <tr
                      key={album._id}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {(currentPage - 1) * albumsPerPage + index + 1}.
                      </td>
                      <td className="p-3 border border-gray-300">
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
                      <td className="p-3 border border-gray-300 text-gray-900">
                        {album.title || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {album.artistId?.name || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {new Date(album.releaseDate).toLocaleDateString() ||
                          "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {album.albumImages.length || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {album.createdBy?.name || "Unknown"}
                      </td>
                      <td className="p-3 border border-gray-300">
                        <div className="flex gap-2 flex-nowrap">
                          <button
                            className="bg-blue-500 hover:bg-blue-700 transition duration-300 text-sm text-white px-3 py-1 rounded whitespace-nowrap cursor-pointer"
                            onClick={() => openEditForm(album)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-700 transition duration-300 text-sm text-white px-3 py-1 rounded whitespace-nowrap cursor-pointer"
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
                      totalPages <= 5 ||
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
                              ? "bg-purple-600 text-white cursor-pointer"
                              : "bg-gray-300 text-gray-800 cursor-pointer"
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
            <div className="fixed inset-0 bg-white/0 backdrop-blur-sm z-50 flex items-center justify-center">
              <div
                ref={albumFormRef}
                className="bg-white p-6 rounded-lg shadow-md w-96 border border-purple-500"
              >
                <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
                  {editId ? "Update Album" : "Add Album"}
                </h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Artist Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Artist
                    </label>
                    <select
                      value={formData.artistId}
                      onChange={(e) =>
                        setFormData({ ...formData, artistId: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm cursor-pointer hover:border-purple-400 transition duration-300"
                    >
                      <option value="">Select Artist</option>
                      {artists.map((artist) => (
                        <option key={artist._id} value={artist._id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.artistId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.artistId}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Release Date
                    </label>
                    <input
                      type="date"
                      className="w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm cursor-pointer"
                      value={formData.releaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          releaseDate: e.target.value,
                        })
                      }
                    />
                    {formErrors.releaseDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.releaseDate}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Album Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border px-3 py-2 rounded bg-white text-gray-500 text-sm hover:border-purple-400 transition duration-300 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, albumImage: file });
                        if (file) {
                          setPreviewImage(URL.createObjectURL(file));
                        } else {
                          setPreviewImage("");
                        }
                      }}
                    />
                    {formErrors.albumImage && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.albumImage}
                      </p>
                    )}
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Album Preview"
                        className="w-16 h-16 object-cover rounded mt-2 border border-purple-500"
                      />
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
