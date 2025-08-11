import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUsers,
  FaHeadphones,
  FaCompactDisc,
  FaThList,
  FaTags,
  FaMusic,
  FaHeart,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

export default function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [artistCount, setArtistCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [genreCount, setGenreCount] = useState(0);
  const [songCount, setSongCount] = useState(0);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const activitiesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [
          userRes,
          artistRes,
          playlistRes,
          albumRes,
          genreRes,
          songRes,
          favouriteRes,
        ] = await Promise.all([
          axios.get(
            "http://localhost:5000/api/auth/users/get-all-user",
            config
          ),
          axios.get(
            "http://localhost:5000/api/auth/artist/get-all-artist",
            config
          ),
          axios.get(
            "http://localhost:5000/api/auth/playlist/get-all-playlist",
            config
          ),
          axios.get(
            "http://localhost:5000/api/auth/album/get-all-album",
            config
          ),
          axios.get(
            "http://localhost:5000/api/auth/genre/get-all-genre",
            config
          ),
          axios.get("http://localhost:5000/api/auth/song/get-all-song", config),
          axios.get(
            "http://localhost:5000/api/auth/favourite/get-all-favourite",
            config
          ),
        ]);

        setUserCount(userRes.data.data.length);
        setArtistCount(artistRes.data.data.length);
        setPlaylistCount(playlistRes.data.data.length);
        setAlbumCount(albumRes.data.data.length);
        setGenreCount(genreRes.data.data.length);
        setSongCount(songRes.data.data.length);
        setFavouriteCount(favouriteRes.data.favourites.length);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to load dashboard data.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get("http://localhost:5000/api/auth/activities/recent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setActivities(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching activities:", err);
      });
  }, []);

  // GET CHARTS
  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/auth/activities/get-user-additions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.data)) {
          const chartLabels = res.data.data.map((item) => item.date);
          const chartCounts = res.data.data.map((item) => item.count);

          const maxCount = Math.max(...chartCounts);
          const suggestedMax = Math.ceil((maxCount + 2) / 5) * 5;

          const chartOptions = {
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: suggestedMax,
                ticks: {
                  stepSize: 1,
                  callback: function (value) {
                    if (Number.isInteger(value)) return value;
                  },
                },
              },
            },
          };

          setChartData({
            labels: chartLabels,
            datasets: [
              {
                label: "User Additions",
                data: chartCounts,
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                borderColor: "#7C3AED",
                tension: 0.4,
                fill: true,
              },
            ],
            options: chartOptions,
          });
        }
      } catch (err) {
        console.error("Error loading user growth data:", err);
      }
    };

    fetchUserGrowth();
  }, []);

  const cards = [
    {
      label: "Users",
      count: userCount,
      icon: <FaUsers />,
      color: "bg-blue-600",
      link: "/users",
    },
    {
      label: "Artists",
      count: artistCount,
      icon: <FaHeadphones />,
      color: "bg-green-500",
      link: "/artists",
    },
    {
      label: "Albums",
      count: albumCount,
      icon: <FaCompactDisc />,
      color: "bg-red-500",
      link: "/albums",
    },
    {
      label: "Playlists",
      count: playlistCount,
      icon: <FaThList />,
      color: "bg-yellow-500",
      link: "/playlists",
    },
    {
      label: "Genres",
      count: genreCount,
      icon: <FaTags />,
      color: "bg-purple-600",
      link: "/genres",
    },
    {
      label: "Songs",
      count: songCount,
      icon: <FaMusic />,
      color: "bg-pink-500",
      link: "/songs",
    },
    {
      label: "Favourites",
      count: favouriteCount,
      icon: <FaHeart />,
      color: "bg-indigo-600",
      link: "/favourites",
    },
  ];

  // memoized filtered list
  const filteredActivities = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") return activities || [];

    const term = searchTerm.trim().toLowerCase();

    return (activities || []).filter((item) => {
      const name = (item.user?.name || "").toString().toLowerCase();
      const email = (item.user?.email || "").toString().toLowerCase();
      const action = (item.action || "").toString().toLowerCase();
      const target = (item.targetType || "").toString().toLowerCase();

      if (searchField === "all") {
        // match any field
        return (
          name.includes(term) ||
          email.includes(term) ||
          action.includes(term) ||
          target.includes(term) ||
          // also try to match date (dd/mm/yyyy)
          (item.createdAt &&
            new Date(item.createdAt)
              .toLocaleDateString("en-GB")
              .toLowerCase()
              .includes(term))
        );
      }

      if (searchField === "name") return name.includes(term);
      if (searchField === "email") return email.includes(term);
      if (searchField === "action") return action.includes(term);
      if (searchField === "target") return target.includes(term);

      if (searchField === "date") {
        if (!item.createdAt) return false;

        // Format to DD/MM/YYYY (same as table display)
        const activityDateStr = new Date(item.createdAt).toLocaleString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

        // Format selected date to same DD/MM/YYYY
        const selectedDateStr = new Date(term).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        return activityDateStr === selectedDateStr;
      }

      return false;
    });
  }, [activities, searchField, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchField, searchTerm]);

  // Pagination
  const totalItems = filteredActivities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(start, start + itemsPerPage);
  }, [filteredActivities, currentPage]);

  const goToPage = (p) => {
    const page = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(page);

    if (activitiesRef.current) {
      activitiesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="space-y-8 px-2 sm:px-4">
      <style>
        {`
          @keyframes scroll-right {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>

      <div className="flex flex-wrap justify-center sm:justify-between gap-4 p-2 sm:p-4 bg-gradient-to-br from-gray-300 via-gray-600 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        <div
          className="flex gap-3 animate-[scroll-right_7s_linear_infinite]"
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="text-2xl sm:text-3xl mt-1">🚀</div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold">
              Welcome Back,{" "}
              <span className="text-black">
                {JSON.parse(localStorage.getItem("user"))?.name || "Admin"}
              </span>
              !
            </h1>

            <p className="text-xs sm:text-sm text-gray-300">
              Stay in control of your dashboard with real-time updates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.link)}
            className={`p-3 ${card.color} text-white rounded-xl shadow-lg cursor-pointer hover:scale-[1.03] transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  {card.label}
                </h3>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">
                  {card.count}
                </p>
              </div>
              <div className="text-2xl sm:text-3xl opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div ref={activitiesRef} className="scroll-mt-24">
          <div className="flex items-center justify-between mt-12">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 underline">
              🕒 Latest Activities
            </h3>

            {/* Search / Filter controls */}
            <div className="flex items-center gap-2">
              <select
                value={searchField}
                onChange={(e) => {
                  setSearchField(e.target.value);
                  setSearchTerm("");
                }}
                className="text-sm px-2 py-1 border rounded-md outline-none text-gray-500 cursor-pointer focus:border-purple-500 focus:ring-0 focus:ring-purple-500"
              >
                <option value="all">All</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="action">Action</option>
                <option value="target">Target</option>
                <option value="date">Date</option>
              </select>

              {searchField !== "date" ? (
                <input
                  type="text"
                  placeholder={
                    searchField === "all"
                      ? "Search by all..."
                      : `Search ${searchField}...`
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-[12px] px-3 py-1 border rounded-md outline-none text-gray-500 w-48 
             focus:border-purple-500 focus:ring-0 focus:ring-purple-500"
                />
              ) : (
                <input
                  type="date"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm px-2 py-1 border rounded-md outline-none w-48"
                />
              )}

              {/* Clear button */}
              <button
                onClick={() => {
                  setSearchField("all");
                  setSearchTerm("");
                }}
                className="text-sm px-2 py-1 border rounded-md bg-gray-200 hover:bg-gray-300 transition duration-300 cursor-pointer text-gray-600"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-200 text-gray-800 border-b border-gray-300">
                <tr>
                  <th className="px-4 sm:px-6 py-3 border-r border-gray-300">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 border-r border-gray-300">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 border-r border-gray-300">
                    Action
                  </th>
                  <th className="px-4 sm:px-6 py-3 border-r border-gray-300">
                    Target
                  </th>
                  <th className="px-4 sm:px-6 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-300 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-300 text-gray-800 text-[14px] sm:text-[15px]">
                        {item.user?.name || "Unknown"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-300">
                        {item.user?.email || "N/A"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-300 capitalize">
                        {item.action?.replaceAll("_", " ") || "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-300">
                        {item.targetType || "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600">
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
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No Recent Activities Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  totalItems || 0
                )}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </strong>{" "}
              of <strong>{totalItems}</strong> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer hover:bg-gray-300 transition duration-300"
              >
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 4),
                    Math.min(totalPages, currentPage + 3)
                  )
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`px-3 py-1 border rounded cursor-pointer hover:bg-gray-200 ${
                        p === currentPage
                          ? "bg-gray-700 text-white hover:bg-gray-800"
                          : ""
                      }`}
                    >
                      {p}
                    </button>
                  ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer hover:bg-gray-300 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mt-10">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 underline">
            📈 User Growth
          </h3>
          {chartData ? (
            <Line data={chartData} options={chartData.options} />
          ) : (
            <p className="text-gray-600">Loading chart...</p>
          )}
        </div>
      </div>
    </div>
  );
}
