import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import {
  FaMusic,
  FaUser,
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
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!isCollapsed && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isCollapsed]);

  const linkClass = ({ isActive }, to) => {
    const isRootAndDashboard = location.pathname === "/" && to === "/dashboard";
    return `group flex ${
      isCollapsed ? "flex-col items-center" : "flex-row items-center"
    } gap-1 py-2 px-4 rounded-lg text-sm font-medium transition w-full whitespace-nowrap ${
      isActive || isRootAndDashboard
        ? "bg-purple-600 text-white shadow"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;
  };

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
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 z-40 bg-gray-900 text-white shadow-lg
    transition-transform duration-300
    ${isCollapsed ? "w-20" : "w-64"}
    sm:translate-x-0
    min-h-screen
    flex flex-col
  `}
      >
        {/* Top - Collapse + Title */}
        <div className={`w-full ${isCollapsed ? "py-4" : "p-4"}`}>
          <div
            className={`flex w-full ${
              isCollapsed ? "justify-center" : "justify-between items-center"
            }`}
          >
            {!isCollapsed && (
              <h1 className="text-2xl font-semibold text-purple-400 underline">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
            </button>
          </div>
        </div>

        {/* Middle - Scrollable Nav */}
        <div
          ref={scrollRef}
          className="flex-1 w-full overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-gray-700"
        >
          <div
            className={`flex flex-col gap-2 w-full transition-all ${
              isCollapsed ? "items-center" : "items-start px-2"
            }`}
          >
            {navItems.map(({ to, icon, label }, i) => (
              <NavLink
                key={i}
                to={to}
                className={(props) => linkClass(props, to)}
              >
                {icon}
                {isCollapsed ? (
                  <span className="text-[10px] mt-1 text-center">{label}</span>
                ) : (
                  <span className="ml-2">{label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom - Logout Button */}
        <div className="w-full p-4">
          <button
            className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition w-full cursor-pointer ${
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

      {/* Main Area */}
      <div
        className={`
    flex-1 w-full min-w-0 transition-all duration-300
    ${isCollapsed ? "ml-20" : "ml-64"}
  `}
      >
        <div className="bg-gray-100 min-h-screen flex flex-col">
          <Topbar user={user} isCollapsed={isCollapsed} />
          <main className="pt-20 p-4 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
