import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { decryptData } from "../api/crypto";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser?.role === "admin") {
        navigate(from, { replace: true });
      }
    }
  }, [from, navigate]);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/users/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, encryptedUserData, iv, key } =
        res.data.data;

      console.log("Login Success", res.data);

      // Decrypt Data
      const decryptedUser = decryptData(encryptedUserData, iv, key);

      if (decryptedUser?.role !== "admin") {
        alert("Only Admins are allowed.");
        return (window.location.href = "/");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(decryptedUser));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      if (err?.response) {
        console.log("Error Response:", err.response.data);
      }
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-purple-600"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-400 underline">
          Admin Login
        </h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Email</label>
          <input
            type="email"
            className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="">
          <label className="block mb-1 text-gray-300">Password</label>
          <input
            type="password"
            className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Forgot Password Link */}
        <div className="mb-4 text-right">
          <a
            href="/forgot-password"
            className="text-[12px] text-purple-400 hover:text-purple-500 transition duration-200"
          >
            Forgot Password?
          </a>
        </div>

        {/* Login Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition duration-300 cursor-pointer">
          Login
        </button>
      </form>
    </div>
  );
}
