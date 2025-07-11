import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [artistCount, setArtistCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [genreCount, setGenreCount] = useState(0);
  const [songCount, setSongCount] = useState(0);
  const [favouriteCount, setFavouriteCount] = useState(0);

  const navigate = useNavigate();

  // FETCH DATA
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const userRes = await axios.get(
        "http://localhost:5000/api/auth/users/get-all-user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserCount(userRes.data.data.length);

      const artistRes = await axios.get(
        "http://localhost:5000/api/auth/artist/get-all-artist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setArtistCount(artistRes.data.data.length);

      const playlistRes = await axios.get(
        "http://localhost:5000/api/auth/playlist/get-all-playlist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPlaylistCount(playlistRes.data.data.length);

      const albumRes = await axios.get(
        "http://localhost:5000/api/auth/album/get-all-album",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlbumCount(albumRes.data.data.length);

      const genreRes = await axios.get(
        "http://localhost:5000/api/auth/genre/get-all-genre",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGenreCount(genreRes.data.data.length);

      const songRes = await axios.get(
        "http://localhost:5000/api/auth/song/get-all-song",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSongCount(songRes.data.data.length);

      const favouriteRes = await axios.get(
        "http://localhost:5000/api/auth/favourite/get-all-favourite",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Favourite Response:", favouriteRes.data);

      setFavouriteCount(favouriteRes.data.favourites.length);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6 underline">
        Welcome to Dashboard
      </h2>

      {/* Cards with navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users */}
        <div
          onClick={() => navigate("/users")}
          className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-3xl">{userCount}</p>
        </div>

        {/* Artists */}
        <div
          onClick={() => navigate("/artists")}
          className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Artists</h3>
          <p className="text-3xl">{artistCount}</p>
        </div>

        {/* Albums */}
        <div
          onClick={() => navigate("/albums")}
          className="bg-red-600 text-white p-6 rounded-lg shadow-md hover:bg-red-700 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Albums</h3>
          <p className="text-3xl">{albumCount}</p>
        </div>

        {/* Playlists */}
        <div
          onClick={() => navigate("/playlists")}
          className="bg-yellow-500 text-white p-6 rounded-lg shadow-md hover:bg-yellow-600 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Playlists</h3>
          <p className="text-3xl">{playlistCount}</p>
        </div>

        {/* Genres */}
        <div
          onClick={() => navigate("/genres")}
          className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:bg-purple-600 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Genres</h3>
          <p className="text-3xl">{genreCount}</p>
        </div>

        {/* Songs */}
        <div
          onClick={() => navigate("/songs")}
          className="bg-pink-500 text-white p-6 rounded-lg shadow-md hover:bg-pink-600 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Songs</h3>
          <p className="text-3xl">{songCount}</p>
        </div>

        {/* Favourites */}
        <div
          onClick={() => navigate("/favourites")}
          className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:bg-indigo-700 cursor-pointer"
        >
          <h3 className="text-lg font-semibold">Favourites</h3>
          <p className="text-3xl">{favouriteCount}</p>
        </div>
      </div>
    </div>
  );
}
