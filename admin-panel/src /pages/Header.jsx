import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, [location]);

  if (isLoggedIn) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white px-8 py-4 shadow-md">
      <h1 className="text-3xl font-bold text-purple-400 tracking-wide underline">
        Admin Panel
      </h1>

      <nav className="flex items-center gap-6">
        <Link
          to="/login"
          className={`text-xl px-3 py-1 rounded transition duration-300 ${
            isActive("/login")
              ? "bg-purple-500 text-white shadow"
              : "text-purple-400 hover:text-white hover:bg-purple-600"
          }`}
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
