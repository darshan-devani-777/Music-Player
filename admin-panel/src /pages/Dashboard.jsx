import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
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
import TextEditor from "../components/TextEditor";

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
  const navigate = useNavigate();

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
        alert("Failed to load dashboard data.");
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

  return (
    <div className="p-2 space-y-8">
      {/* Welcome Banner */}
      <style>
        {`
          @keyframes scroll-right {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>

      <div className="flex justify-center gap-4 p-2 bg-gradient-to-br from-gray-300 via-gray-600 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        <div
          className="flex gap-3 animate-[scroll-right_10s_linear_infinite]"
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="text-3xl mt-2">🚀</div>
          <div>
            <h1 className="text-lg font-semibold">Welcome Back, Admin!</h1>
            <p className="text-[13px] text-gray-300">
              Stay in control of your dashboard with real-time updates.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.link)}
            className={`p-3 ${card.color} text-white rounded-xl shadow-lg cursor-pointer hover:scale-[1.03] transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{card.label}</h3>
                <p className="text-3xl font-semibold mt-1">{card.count}</p>
              </div>
              <div className="text-3xl opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Activities */}
      <div className="">
        <h3 className="text-xl font-semibold text-gray-800 underline">
          🕒 Latest Activities
        </h3>
        <div className="mt-5 overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm text-left text-gray-300 dark:bg-gray-900 border border-gray-700">
            <thead className="text-xs uppercase bg-gray-800 text-white border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 border-r border-gray-700">Name</th>
                <th className="px-6 py-3 border-r border-gray-700">Email</th>
                <th className="px-6 py-3 border-r border-gray-700">Action</th>
                <th className="px-6 py-3 border-r border-gray-700">Target</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 cursor-pointer dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 border-r border-gray-700">
                    {item.user?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-700">
                    {item.user?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-700">
                    {item.action.replaceAll("_", " ")}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-700">
                    {item.targetType}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {(() => {
                      const date = new Date(item.createdAt);

                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const year = date.getFullYear();

                      let hours = date.getHours();
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        "0"
                      );
                      const ampm = hours >= 12 ? "PM" : "AM";
                      hours = hours % 12 || 12;

                      return `${day}/${month}/${year} , ${hours}:${minutes} ${ampm}`;
                    })()}
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No Recent Activities Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          📈 User Growth
        </h3>
        {chartData ? (
          <Line data={chartData} options={chartData.options} />
        ) : (
          <p className="text-gray-600">Loading chart...</p>
        )}
      </div>

      {/* Text Editor */}
      <TextEditor />
    </div>
  );
}
