import React, { useState, useEffect } from "react";
import api from "../api/axios"; 

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    artistImage: null,
  });
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  // FETCH ARTIST
  const fetchArtists = async () => {
    try {
      const res = await api.get(
        "auth/artist/get-all-artist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setArtists(res.data.data);
    } catch (err) {
      alert("Failed to fetch artists");
    }
  };

  // DELETE ARTIST
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      await api.delete(
        `auth/artist/delete-artist/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchArtists();
    } catch (err) {
      alert("Failed to delete artist");
    }
  };

  // ADD ARTIST
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("bio", formData.bio);

    if (formData.artistImage) {
      data.append("artistImage", formData.artistImage);
    }

    try {
      if (editId) {
        // Update artist
        await api.put(
          `auth/artist/update-artist/${editId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create artist
        await api.post(
          "auth/artist/create-artist",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      fetchArtists();
      setFormData({ name: "", bio: "", artistImage: null });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      alert("Failed to save artist");
    }
  };

  // EDIT FORM
  const openEditForm = (artist) => {
    setEditId(artist._id);
    setFormData({
      name: artist.name,
      bio: artist.bio,
      artistImage: artist.artistImage[0] || "",
    });
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ name: "", bio: "", artistImage: "" });
    setShowForm(true);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-2xl font-semibold underline">Artist Management</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 cursor-pointer"
          onClick={openAddForm}
        >
          + Artist
        </button>
      </div>

      {/* Artist Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
              <th className="p-3 border dark:border-gray-600">Image</th>
              <th className="p-3 border dark:border-gray-600">Name</th>
              <th className="p-3 border dark:border-gray-600">Bio</th>
              <th className="p-3 border dark:border-gray-600">Created By</th>
              <th className="p-3 border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No artists found.
                </td>
              </tr>
            ) : (
              artists.map((artist) => (
                <tr
                  key={artist._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="p-3 border dark:border-gray-600">
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
                  <td className="p-3 border dark:border-gray-600 text-white">
                    {artist.name}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {artist.bio}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {artist.createdBy?.name || "Unknown"}
                  </td>
                  <td className="p-3 border dark:border-gray-600">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4 text-center text-purple-500">
              {editId ? "Update Artist" : "Add Artist"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, artistImage: e.target.files[0] })
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
