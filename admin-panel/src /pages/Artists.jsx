import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Spinner";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    artistImage: null,
  });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const artistsPerPage = 7;
  const artistFormRef = useRef();

  const token = localStorage.getItem("token");

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const bio = formData.bio.trim();

    if (!name) {
      newErrors.name = "Name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Name can only contain alphabets and spaces.";
    } else if (!/[aeiouAEIOU]/.test(name)) {
      newErrors.name = "Name must contain at least one vowel (a, e, i, o, u).";
    }

    if (!bio) {
      newErrors.bio = "Bio is required.";
    } else if (bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters long.";
    } else if (!/^[A-Za-z\s.,!?'"]+$/.test(bio)) {
      newErrors.bio = "Bio contains invalid characters.";
    } else if (!/[aeiouAEIOU]/.test(bio)) {
      newErrors.bio = "Bio must contain at least one vowel (a, e, i, o, u).";
    }

    if (!editId && !formData.artistImage) {
      newErrors.artistImage = "Image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchArtists();
  }, [currentPage]);

  const LOADER_DELAY = 1000;

  // FETCH ARTIST
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("auth/artist/get-all-artist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch artists:", err);
      toast.error("Failed to fetch artists.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // DELETE ARTIST
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;

    try {
      await api.delete(`auth/artist/delete-artist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Artist deleted successfully...");

      const res = await api.get("auth/artist/get-all-artist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allArtists = res.data.data;

      const filtered = allArtists.filter((artist) => {
        const q = searchQuery.toLowerCase();
        return (
          artist.name?.toLowerCase().includes(q) ||
          artist.bio?.toLowerCase().includes(q)
        );
      });

      const indexOfLast = currentPage * artistsPerPage;
      const indexOfFirst = indexOfLast - artistsPerPage;
      const currentPageArtists = filtered.slice(indexOfFirst, indexOfLast);

      if (currentPageArtists.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        setArtists(allArtists);
      } else {
        setArtists(allArtists);
      }
    } catch (err) {
      toast.error("Failed to delete artist.");
    }
  };

  // CREATE / EDIT ARTIST
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("bio", formData.bio);
    data.append("userId", userId);

    if (formData.artistImage) {
      data.append("artistImage", formData.artistImage);
    }

    try {
      if (editId) {
        await api.put(`auth/artist/update-artist/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Artist updated successfully.");
      } else {
        await api.post(`auth/artist/create-artist`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Artist created successfully.");
      }

      await fetchArtists();
      setFormData({ name: "", bio: "", artistImage: null });
      setEditId(null);
      setShowForm(false);
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save artist.");
    }
  };

  const openEditForm = (artist) => {
    setEditId(artist._id);
    setFormData({
      name: artist.name,
      bio: artist.bio,
      artistImage: null,
    });

    if (artist.artistImage && artist.artistImage.length > 0) {
      setPreviewImage(artist.artistImage[0]);
    } else {
      setPreviewImage("");
    }

    setShowForm(true);
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ name: "", bio: "", artistImage: null });
    setPreviewImage("");
    setShowForm(true);
  };

  useEffect(() => {
    if (!showForm) {
      setPreviewImage("");
      setFormData({ name: "", bio: "", artistImage: null });
      setErrors({});
      setEditId(null);
    }
  }, [showForm]);

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        artistFormRef.current &&
        !artistFormRef.current.contains(event.target)
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

  // FILTER ARTIST
  const filteredArtists = artists.filter((artist) => {
    const q = searchQuery.toLowerCase();
    return (
      artist.name?.toLowerCase().includes(q) ||
      artist.bio?.toLowerCase().includes(q)
    );
  });

  const indexOfLast = currentPage * artistsPerPage;
  const indexOfFirst = indexOfLast - artistsPerPage;
  const currentArtists = filteredArtists.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredArtists.length / artistsPerPage);

  return (
    <div>
      {loading && <Loader />}
      
      {!loading && (
        <>
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-7">
              <div className="justify-self-start">
                <h2 className="text-2xl font-sans font-semibold underline">
                  Artist Management
                </h2>
              </div>

              <div className="justify-self-center w-full relative max-w-sm">
                <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by name or bio..."
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
                  + Artist
                </button>
              </div>
            </div>
          </div>

          {/* Artist Table */}
          <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="uppercase text-xs">
                <tr className="bg-gray-200 text-left text-gray-700">
                  <th className="p-3 border border-gray-300">ID</th>
                  <th className="p-3 border border-gray-300">Image</th>
                  <th className="p-3 border border-gray-300">Name</th>
                  <th className="p-3 border border-gray-300">Bio</th>
                  <th className="p-3 border border-gray-300">Created By</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentArtists.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      Artists Not Found.
                    </td>
                  </tr>
                ) : (
                  currentArtists.map((artist, index) => (
                    <tr
                      key={artist._id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {(currentPage - 1) * artistsPerPage + index + 1}.
                      </td>
                      <td className="p-3 border border-gray-300">
                        {artist.artistImage.length > 0 ? (
                          <img
                            src={artist.artistImage[0]}
                            alt={artist.name}
                            className="w-14 h-14 object-cover rounded"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-800">
                        {artist.name || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-600 text-sm">
                        {artist.bio || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-600 text-sm">
                        {artist.createdBy?.name || "Unknown"}
                      </td>
                      <td className="p-3 border border-gray-300 whitespace-nowrap">
                        <button
                          className="bg-blue-500 text-white text-sm px-3 py-1 rounded mr-2 hover:bg-blue-700 transition duration-300 cursor-pointer"
                          onClick={() => openEditForm(artist)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition duration-300 cursor-pointer"
                          onClick={() => handleDelete(artist._id)}
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

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-sm z-50 flex items-center justify-center">
              <div
                ref={artistFormRef}
                className="bg-white p-6 rounded-lg shadow-md w-96 border border-purple-500"
              >
                <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
                  {editId ? "Update Artist" : "Add Artist"}
                </h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-500 text-gray-500 text-sm"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs">{errors.name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Bio
                    </label>
                    <textarea
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-500 text-gray-500 text-sm"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    ></textarea>
                    {errors.bio && (
                      <p className="text-red-500 text-xs">{errors.bio}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-black font-semibold mb-1">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border px-3 py-2 rounded cursor-pointer hover:border-purple-500 text-gray-500 text-sm"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, artistImage: file });
                        if (file) setPreviewImage(URL.createObjectURL(file));
                        else setPreviewImage("");
                      }}
                    />

                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded mb-3 mt-3 border border-gray-600"
                      />
                    )}

                    {errors.artistImage && (
                      <p className="text-red-500 text-xs">
                        {errors.artistImage}
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
                    totalPages <= 4 || isFirstTwo || isLastTwo || isNearCurrent;

                  if (shouldShow) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 rounded ${
                          isCurrent
                            ? "bg-purple-600 text-white"
                            : "bg-gray-300 text-gray-500"
                        } hover:bg-purple-600 hover:text-white transition duration-300 cursor-pointer`}
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
        </>
      )}
    </div>
  );
}
