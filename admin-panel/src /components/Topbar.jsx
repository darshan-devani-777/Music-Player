import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaBell, FaHome, FaUserCircle, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function Topbar({ user, isCollapsed }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const dropdownRef = useRef(null);
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
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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

  return (
    <>
      {/* Topbar */}
      <header
        className={`bg-gray-900 text-white shadow-lg flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-40 transition-all ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Left: Page Path */}
        <div className="text-md font-semibold hidden sm:flex items-center gap-2">
          {!isDashboard ? (
            <>
              <FaHome
                className="cursor-pointer text-gray-400 hover:text-blue-400"
                onClick={() => navigate("/")}
              />
              <span>/</span>
              <span className="text-white">{pathSegments.join(" / ")}</span>
            </>
          ) : (
            <span className="text-white">Dashboard</span>
          )}
        </div>

        <div className="flex items-center gap-6 relative">
          {/* Notification Bell */}
          <div className="relative cursor-pointer">
            <FaBell className="text-xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              5
            </span>
          </div>

          {/* User Info */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <FaUser className="text-lg hover:text-blue-300 transition duration-75" />
              {!isCollapsed && (
                <div className="text-sm flex flex-col">
                  <span className="font-semibold">{user?.name || "User"}</span>
                  <span className="text-xs text-green-300 capitalize">
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center border-2 border-purple-400">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <img
                src={avatarUrl}
                alt="User"
                className="w-24 h-24 rounded-full border-4 border-purple-600 shadow-lg"
              />
            </div>

            {/* Info */}
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{user?.name || "User Name"}</h2>
            <p className="text-sm text-gray-600"><strong className="text-purple-600 text-md">Role:</strong> {user?.role || "N/A"}</p>
            <p className="text-sm text-gray-600 mb-4"><strong className="text-purple-600 text-md">Email:</strong> {user?.email || "user@example.com"}</p>

            {/* Close Button */}
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
