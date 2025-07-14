import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const linkClass = ({ isActive }) =>
    `px-4 py-1 rounded text-sm font-medium transition ${
      isActive
        ? "bg-purple-600 text-white shadow"
        : "text-gray-300 hover:bg-gray-600 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar */}
      <aside className="w-64 h-screen fixed top-0 left-0 bg-gradient-to-b from-gray-900 to-gray-900 text-white p-6 shadow-lg z-10 flex flex-col justify-between">
        <div>
          <h1 className="text-center text-3xl font-bold mb-8 text-purple-300 border-b border-purple-500 pb-2">
            Admin Panel
          </h1>

          {/* Admin Info */}
          {user ? (
            <div className="p-4 rounded-md bg-gray-800 border border-purple-500 shadow-md space-y-1">
              <p className="text-lg font-semibold text-purple-300 truncate">
                {user.name}
              </p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
              <p className="text-sm text-green-400">
                Role: <span className="capitalize">{user.role}</span>
              </p>
            </div>
          ) : (
            <div className="text-gray-400 mb-6">No user found</div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3 my-8">
            <NavLink to="/dashboard" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/users" className={linkClass}>
              Users
            </NavLink>
            <NavLink to="/artists" className={linkClass}>
              Artists
            </NavLink>
            <NavLink to="/albums" className={linkClass}>
              Albums
            </NavLink>
            <NavLink to="/playlists" className={linkClass}>
              Playlists
            </NavLink>
            <NavLink to="/genres" className={linkClass}>
              Genres
            </NavLink>
            <NavLink to="/songs" className={linkClass}>
              Songs
            </NavLink>
            <NavLink to="/favourites" className={linkClass}>
              Favourites
            </NavLink>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          className="bg-red-500 hover:bg-red-700 transition duration-300 text-white px-4 py-2 rounded shadow cursor-pointer w-full mt-6"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
