import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaUser,
  FaMusic,
  FaHeadphones,
  FaThLarge,
  FaListAlt,
  FaCompactDisc,
  FaHeart,
  FaSignOutAlt,
  FaTachometerAlt,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `group flex ${
      isCollapsed
        ? "flex-col items-center justify-center"
        : "flex-row items-center justify-start"
    } gap-1 py-2 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap w-full
     ${
       isActive
         ? "bg-purple-600 text-white shadow"
         : "text-gray-300 hover:bg-gray-700 hover:text-white"
     }`;

  const navItems = [
    { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/users", icon: <FaUser />, label: "Users" },
    { to: "/artists", icon: <FaHeadphones />, label: "Artists" },
    { to: "/albums", icon: <FaCompactDisc />, label: "Albums" },
    { to: "/playlists", icon: <FaThLarge />, label: "Playlists" },
    { to: "/genres", icon: <FaListAlt />, label: "Genres" },
    { to: "/songs", icon: <FaMusic />, label: "Songs" },
    { to: "/favourites", icon: <FaHeart />, label: "Favourites" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`h-screen fixed top-0 left-0 bg-gray-900 text-white shadow-lg z-50 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20 items-center" : "w-64 items-start"
        }`}
      >
        {/* Collapse Button */}
        <div className={`w-full ${isCollapsed ? "py-4" : "p-4"}`}>
          <div
            className={`flex w-full flex-col ${
              isCollapsed ? "items-center" : "items-end"
            }`}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full text-white transition cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
            </button>

            {!isCollapsed && (
              <h1 className="text-2xl font-semibold text-purple-400 mt-3 underline text-start w-full">
                Admin Panel
              </h1>
            )}
          </div>
        </div>

        {/* Admin Info */}
        {!isCollapsed && user && (
          <div className="px-4 w-full">
            <div className="p-3 rounded bg-gray-800 border border-purple-600 mb-2">
              <p className="text-lg font-semibold text-purple-300">
                {user.name}
              </p>
              <p className="text-[14px] text-gray-400">{user.email}</p>
              <p className="text-sm text-green-400 capitalize mt-1">
                Role: {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          className={`flex-1 flex flex-col gap-2 w-full transition-all mt-12 ${
            isCollapsed
              ? "justify-center items-center"
              : "justify-start items-start px-4"
          }`}
        >
          {navItems.map(({ to, icon, label }, i) => (
            <NavLink key={i} to={to} className={linkClass}>
              {icon}
              {isCollapsed ? (
                <span className="text-[10px] mt-1 text-center leading-tight">
                  {label}
                </span>
              ) : (
                <span className="ml-2">{label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 w-full">
          <button
            className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition cursor-pointer w-full ${
              isCollapsed ? "justify-center px-2" : "justify-center"
            }`}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            <FaSignOutAlt />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        } p-6 overflow-y-auto`}
      >
        <Outlet />
      </main>
    </div>
  );
}
