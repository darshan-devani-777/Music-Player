import React, { useState, useRef, useEffect } from "react";
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

export default function Topbar({ user, isCollapsed }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState([]);

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

  const fetchUnseenCount = async () => {
    try {
      const res = await api.get("/auth/activities/unseen-count");
      console.log("unseen-count response:", res?.data);

      const cnt =
        res?.data?.count ??
        res?.data?.data?.count ??
        res?.data?.unseen ??
        0;

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

  const handleBellClick = async () => {
    try {
      const isOpening = !showNotifications;
      setShowNotifications(isOpening);

      if (!isOpening) return;

      const res = await api.get("/auth/activities/recent");
      const allActivities = res?.data?.data ?? res?.data ?? [];
      console.log("recent activities:", allActivities);
      setActivities(allActivities);

      setNotificationCount(0);

      const idsToMark = (allActivities || [])
        .slice(0, 5)
        .map((a) => a._id)
        .filter(Boolean);

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
              <div className="absolute -right-32 top-8 mt-2 w-64 bg-white rounded-lg shadow-md ring-1 ring-black ring-opacity-5 z-50 max-h-72 overflow-y-auto">
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
                    {activities.slice(0, 5).map((act, idx) => (
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
              <div className="absolute -right-4 mt-4 w-36 bg-gray-900 text-white rounded shadow-lg z-50 p-1">
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
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center border-2 border-purple-400">
            <div className="flex justify-center mb-4">
              <img
                src={avatarUrl}
                alt="User"
                className="w-24 h-24 rounded-full border-4 border-purple-600 shadow-lg"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {user?.name || "User Name"}
            </h2>
            <p className="text-sm text-gray-600">
              <strong className="text-purple-600 text-md">Role:</strong>{" "}
              {user?.role || "N/A"}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong className="text-purple-600 text-md">Email:</strong>{" "}
              {user?.email || "user@example.com"}
            </p>
            <button
              className="mt-2 px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300 cursor-pointer"
              onClick={() => setShowProfileModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
