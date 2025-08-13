import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Spinner";

export default function Favourites() {
  const [allFavourites, setAllFavourites] = useState([]);
  const [userFavourites, setUserFavourites] = useState([]);
  const [songFavourites, setSongFavourites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [songId, setSongId] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllFavourites();
    }
  }, [activeTab]);

  const LOADER_DELAY = 1000;

  // FETCH ALL FAVOURITE
  const fetchAllFavourites = async () => {
    setLoading(true);
    try {
      const res = await api.get("auth/favourite/get-all-favourite", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllFavourites(res.data.favourites);
      setError("");
    } catch (err) {
      console.error("Error fetching all favourites:", err);
      setError("Failed to fetch all favourites");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
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
    } catch (err) {
      console.error("Error fetching favourites by user:", err);
      setError("Failed to fetch by user ID");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
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
    } catch (err) {
      console.error("Error fetching users by song:", err);
      setError("Failed to fetch users by song ID");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
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
      {/* Loader */}
      {loading && <Loader />}

      {!loading && (
        <>
          <h2 className="text-2xl font-semibold underline">
            Favourite Management
          </h2>

          <div className="flex flex-wrap justify-between items-center gap-3 my-7">
            <div className="flex flex-wrap gap-3">
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
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow transition duration-300 cursor-pointer"
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
                    ? "bg-blue-600 hover:bg-blue-700 transition duration-300 cursor-pointer text-white shadow"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-300 cursor-pointer transition duration-300"
                }`}
              >
                By Song ID
              </button>
            </div>

            {/* Search Bar */}
            <div className="justify-self-center w-full relative max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by song, user, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-purple-400 !placeholder:text-gray-100"
              />
            </div>
          </div>

          {/* User ID Input */}
          {activeTab === "user" && (
            <div className="flex flex-col gap-1 mb-1">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className={`flex-1 px-4 py-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition text-[13px] ${
                    error
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  onClick={fetchFavouritesByUser}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300 cursor-pointer"
                >
                  Search
                </button>
              </div>
              {/* Error message below input */}
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          )}

          {/* Song ID Input */}
          {activeTab === "song" && (
            <div className="flex flex-col gap-1 mb-1">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter Song ID"
                  value={songId}
                  onChange={(e) => setSongId(e.target.value)}
                  className={`flex-1 px-4 py-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 transition text-[13px] ${
                    error
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  onClick={fetchUsersBySong}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300 cursor-pointer"
                >
                  Search
                </button>
              </div>
              {/* Error message below input */}
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300 mt-4">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="uppercase text-xs">
                <tr className="bg-gray-200 text-left text-gray-700">
                  <th className="p-3 border border-gray-300">ID</th>
                  <th className="p-3 border border-gray-300">Song</th>
                  <th className="p-3 border border-gray-300">User</th>
                  <th className="p-3 border border-gray-300">Email</th>
                  <th className="p-3 border border-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      Favourites Not Found.
                    </td>
                  </tr>
                ) : (
                  currentList.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {(currentPage - 1) * perPage + index + 1}.
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-900">
                        {item.song?.title || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {item.user?.name || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {item.user?.email || "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                        {item.createdAt
                          ? new Date(item.createdAt)
                              .toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .replace(",", " ,")
                          : "N/A"}
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
        </>
      )}
    </div>
  );
}
