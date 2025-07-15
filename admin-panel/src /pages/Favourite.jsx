import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Favourites() {
  const [allFavourites, setAllFavourites] = useState([]);
  const [userFavourites, setUserFavourites] = useState([]);
  const [songFavourites, setSongFavourites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [songId, setSongId] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 7;
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllFavourites();
    }
  }, [activeTab]);

  // FETCH ALL FAVOURITE
  const fetchAllFavourites = async () => {
    setLoading(true);
    try {
      const res = await api.get("auth/favourite/get-all-favourite", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllFavourites(res.data.favourites);
      setError("");
    } catch {
      setError("Failed to fetch all favourites");
    } finally {
      setLoading(false);
    }
  };

  // FETCH FAVOURITE BY USER
  const fetchFavouritesByUser = async () => {
    if (!userId.trim()) return setError("Please enter User ID");
    setLoading(true);
    try {
      const res = await api.get(
        `auth/favourite/get-all-favourite-specific-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserFavourites(res.data.favourites);
      setError("");
    } catch {
      setError("Failed to fetch by user ID");
    } finally {
      setLoading(false);
    }
  };

  // FETCH USER BY SONG
  const fetchUsersBySong = async () => {
    if (!songId.trim()) return setError("Please enter Song ID");
    setLoading(true);
    try {
      const res = await api.get(
        `auth/favourite/get-all-user-specific-favourite/song/${songId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSongFavourites(res.data.users);
      setError("");
    } catch {
      setError("Failed to fetch users by song ID");
    } finally {
      setLoading(false);
    }
  };

  // FILTERED LIST
  const dataList =
    activeTab === "all"
      ? allFavourites
      : activeTab === "user"
      ? userFavourites
      : songFavourites;

  const filtered = dataList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.song?.title?.toLowerCase().includes(q) ||
      item.user?.name?.toLowerCase().includes(q) ||
      item.user?.email?.toLowerCase().includes(q)
    );
  });

  const indexLast = currentPage * perPage;
  const indexFirst = indexLast - perPage;
  const currentList = filtered.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="">
      <h2 className="text-2xl font-semibold border-b pb-2">
        Favourite Management
      </h2>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-3 my-7">
        {/* All Favourites */}
        <button
          onClick={() => {
            setActiveTab("all");
            setUserId("");
            setSongId("");
            setUserFavourites([]);
            setSongFavourites([]);
          }}
          className={`px-5 py-2 rounded-lg font-medium transition text-sm ${
            activeTab === "all"
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow transition duration-300 cursor-pointer"
              : "bg-gray-100 text-gray-800 hover:bg-gray-300 cursor-pointer transition duration-300"
          }`}
        >
          All Favourites
        </button>

        {/* By User ID */}
        <button
          onClick={() => {
            setActiveTab("user");
            setSongId("");
            setAllFavourites([]);
            setSongFavourites([]);
            setUserFavourites([]);
            setUserId("");
          }}
          className={`px-5 py-2 rounded-lg font-medium transition text-sm ${
            activeTab === "user"
              ? "bg-green-600 hover:bg-green-700 text-white shadow transition duration-300 cursor-pointer"
              : "bg-gray-100 text-gray-800 hover:bg-gray-300 cursor-pointer transition duration-300"
          }`}
        >
          By User ID
        </button>

        {/* By Song ID */}
        <button
          onClick={() => {
            setActiveTab("song");
            setUserId("");
            setAllFavourites([]);
            setUserFavourites([]);
            setSongFavourites([]);
            setSongId("");
          }}
          className={`px-5 py-2 rounded-lg font-medium transition text-sm ${
            activeTab === "song"
              ? "bg-purple-600 hover:bg-purple-700 transition duration-300 cursor-pointer text-white shadow"
              : "bg-gray-100 text-gray-800 hover:bg-gray-300 cursor-pointer transition duration-300"
          }`}
        >
          By Song ID
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by song, user, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-blue-500 focus:outline-none focus:border-red-400"
        />
      </div>

      {/* User ID Input */}
      {activeTab === "user" && (
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm"
          />
          <button
            onClick={fetchFavouritesByUser}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300 cursor-pointer"
          >
            Search
          </button>
        </div>
      )}

      {/* Song ID Input */}
      {activeTab === "song" && (
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter Song ID"
            value={songId}
            onChange={(e) => setSongId(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
          />
          <button
            onClick={fetchUsersBySong}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300 cursor-pointer"
          >
            Search
          </button>
        </div>
      )}

      {/* Error & Loading */}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading && <p className="text-blue-500 mb-2">Loading...</p>}

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900">
        <table className="w-full text-sm text-left border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white uppercase text-xs">
            <tr>
              <th className="p-3 border dark:border-gray-600">ID</th>
              <th className="p-3 border border-gray-700">Song</th>
              <th className="p-3 border border-gray-700">User</th>
              <th className="p-3 border border-gray-700">Email</th>
              <th className="p-3 border border-gray-700">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {currentList.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Favourites Not Found.
                </td>
              </tr>
            ) : (
              currentList.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-800 transition">
                  <td className="p-3 border dark:border-gray-600 text-gray-300 text-sm">
                    {(currentPage - 1) * perPage + index + 1}.
                  </td>
                  <td className="p-3 border border-gray-700 text-gray-400">
                    {item.song?.title || "—"}
                  </td>
                  <td className="p-3 border border-gray-700 text-gray-400">
                    {item.user?.name || "—"}
                  </td>
                  <td className="p-3 border border-gray-700 text-gray-400">
                    {item.user?.email || "—"}
                  </td>
                  <td className="p-3 border border-gray-700 text-gray-400">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-md ${
                currentPage === i + 1
                  ? "bg-purple-600 text-white transition duration-300 cursor-pointer"
                  : "bg-gray-700 text-gray-300 transition duration-300 cursor-pointer"
              } hover:bg-purple-700 transition`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
