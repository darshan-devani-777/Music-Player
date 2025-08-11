import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaBell,
  FaHome,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Topbar({ isCollapsed }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegments =
    location.pathname === "/"
      ? []
      : location.pathname
          .split("/")
          .filter(Boolean)
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  const isDashboard = location.pathname === "/";

  useEffect(() => {
    const syncUserFromLocalStorage = () => {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (
        parsedUser &&
        location.pathname.startsWith("/admin") &&
        parsedUser.role !== "admin"
      ) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      setUser(parsedUser);
    };

    syncUserFromLocalStorage();
    window.addEventListener("storage", syncUserFromLocalStorage);

    return () => {
      window.removeEventListener("storage", syncUserFromLocalStorage);
    };
  }, [location.pathname]);

  // UNSEEN COUNT
  const fetchUnseenCount = async () => {
    try {
      const res = await api.get("/auth/activities/unseen-count");
      const cnt =
        res?.data?.count ?? res?.data?.data?.count ?? res?.data?.unseen ?? 0;

      setNotificationCount(Number(cnt) || 0);
    } catch (err) {
      console.error("Error fetching unseen count", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showProfileModal) {
      const randomId = Math.floor(Math.random() * 10000);
      setAvatarUrl(`https://i.pravatar.cc/150?u=${randomId}`);
    }
  }, [showProfileModal]);

  useEffect(() => {
    let mounted = true;
    fetchUnseenCount();

    const interval = setInterval(() => {
      if (!mounted) return;
      fetchUnseenCount();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // RECENT ACTIVITY / SEEN COUNT
  const handleBellClick = async () => {
    try {
      const isOpening = !showNotifications;
      setShowNotifications(isOpening);

      if (!isOpening) return;

      const res = await api.get("/auth/activities/recent");
      const allActivities = res?.data?.data ?? res?.data ?? [];

      const unseenActivities = allActivities.filter((a) => !a.seen);
      setActivities(unseenActivities);

      setNotificationCount(0);

      const idsToMark = unseenActivities.map((a) => a._id).filter(Boolean);

      if (idsToMark.length > 0) {
        try {
          await api.post("/auth/activities/mark-as-seen", { ids: idsToMark });
          await fetchUnseenCount();
        } catch (err) {
          console.warn("mark-seen failed, keeping optimistic UI:", err);
        }
      } else {
        await fetchUnseenCount();
      }
    } catch (err) {
      console.error("Error loading notifications", err);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully...!");

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <>
      {/* Topbar */}
      <header
        className={`bg-gray-900 text-white shadow-lg flex flex-wrap items-center justify-between px-3 sm:px-4 py-3 fixed top-0 left-0 right-0 z-40 transition-all ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="text-sm sm:text-base font-semibold hidden sm:flex items-center gap-2 truncate">
          {!isDashboard ? (
            <>
              <FaHome
                className="cursor-pointer text-gray-400 hover:text-blue-400"
                onClick={() => navigate("/")}
              />
              <span>/</span>
              <span className="text-white truncate">
                {pathSegments.join(" / ")}
              </span>
            </>
          ) : (
            <span className="text-white">Dashboard</span>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6 relative">
          {/* Notification Bell */}
          <div
            className="relative cursor-pointer hover:text-blue-400 transition duration-300"
            onClick={handleBellClick}
            ref={notificationRef}
          >
            <FaBell className="text-xl" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {notificationCount}
              </span>
            )}

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="fixed top-[56px] right-1 mt-2 w-64 bg-white rounded-lg shadow-md ring-1 ring-black ring-opacity-5 z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 border-b bg-gray-200 flex items-center justify-center">
                  <h3 className="text-[12px] font-semibold text-red-600 underline">
                    Recent Activities
                  </h3>
                </div>

                {activities.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-gray-500 text-center">
                    No recent activities
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {activities.map((act, idx) => (
                      <li
                        key={act._id || idx}
                        className="px-3 py-1 text-xs hover:bg-gray-50 transition-colors duration-150 flex items-start gap-2"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                          {act?.user?.name?.[0] || "?"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 truncate text-[10px]">
                              {act?.user?.name || "Unknown"}
                            </span>
                            {act?.action && (
                              <span className="ml-2 text-[9px] font-semibold text-indigo-500 uppercase tracking-wide whitespace-nowrap">
                                {act.action.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          {act.description && (
                            <div className="text-gray-600 truncate text-[11px] mt-0.5">
                              {act.description}
                            </div>
                          )}

                          <div className="text-gray-400 text-[10px] mt-1">
                            {new Date(act.createdAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Calcutta",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <FaUser className="text-lg hover:text-blue-400 transition duration-75" />
              {!isCollapsed && (
                <div className="text-xs sm:text-sm flex flex-col">
                  <span className="font-semibold truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] sm:text-xs text-green-300 capitalize truncate">
                    {user?.role || ""}
                  </span>
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="fixed top-[52px] right-0 w-36 bg-gray-900 text-white rounded shadow-lg z-50 p-1">
                <div
                  className="px-4 py-2 hover:text-blue-300 cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                >
                  <FaUserCircle className="text-base" />
                  View Profile
                </div>

                <div
                  className="px-4 py-2 hover:text-blue-300 cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/");
                  }}
                >
                  <FaCog className="text-base" />
                  Settings
                </div>

                <div
                  className="px-4 py-2 cursor-pointer text-red-400 hover:text-red-600 text-sm flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="text-base" />
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full h-full flex items-center justify-center">
            <div className="p-6 w-[90%] max-w-md text-center relative bg-gray-900 rounded-xl shadow-2xl border-1 border-purple-700">
              <h3 className="text-xl font-semibold text-white underline decoration-purple-400 mb-6">
                View Profile
              </h3>

              <img
                src={avatarUrl}
                alt="User"
                className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg mx-auto mb-7"
              />

              {!isEditing ? (
                // View Mode
                <div className="space-y-4 text">
                  <div>
                    <label className="block font-medium text-purple-400">
                      Name
                    </label>
                    <p className="text-sm text-gray-200">{user?.name}</p>
                  </div>

                  <div>
                    <label className="block font-medium text-purple-400">
                      Email
                    </label>
                    <p className="text-sm text-gray-200">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block font-medium text-purple-400">
                      Password
                    </label>
                    <p className="text-gray-300 italic text-sm">••••••••</p>
                  </div>

                  <div>
                    <label className="block font-medium text-purple-400">
                      Role
                    </label>
                    <p className="text-sm font-semibold capitalize text-green-400">
                      {user?.role}
                    </p>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Password{" "}
                      <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="password"
                      value={user?.password || ""}
                      onChange={(e) =>
                        setUser((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="New password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Role
                    </label>
                    <select
                      value={user?.role || ""}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, role: e.target.value }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Select role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-between items-center mt-6 gap-3">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm transition duration-300 cursor-pointer"
                  onClick={() => {
                    setIsEditing(false);
                    setShowProfileModal(false);
                  }}
                >
                  Cancel
                </button>

                {!isEditing ? (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm transition duration-300 cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition duration-300 cursor-pointer"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const payload = {
                          name: user.name,
                          email: user.email,
                          role: user.role,
                        };
                        if (user.password && user.password.trim() !== "") {
                          payload.password = user.password;
                        }

                        const res = await api.put(
                          `/auth/users/update-user/${user._id}`,
                          payload,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );

                        const updatedUser = { ...user, password: undefined };
                        localStorage.setItem(
                          "user",
                          JSON.stringify(updatedUser)
                        );
                        window.dispatchEvent(new Event("storage"));

                        toast.success("Profile updated successfully...!");
                        setIsEditing(false);
                        setShowProfileModal(false);
                      } catch (err) {
                        console.error("Failed to update profile:", err);
                        toast.error("Error updating profile.");
                      }
                    }}
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
