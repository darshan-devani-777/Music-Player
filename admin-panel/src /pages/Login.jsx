import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
      const res = await axios.post("http://localhost:5000/api/auth/users/login", {
        email,
        password,
      });
  
      const { accessToken, user } = res.data.data;
  
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
  
      if (user.role !== "admin") {
        alert("Only Admins are allowed. Redirecting...");
        return window.location.href = "/";
      }
  
      navigate("/dashboard", { replace: true });
  
    } catch (err) {
      console.error("Login error:", err);
      alert(err?.response?.data?.message || "Login failed");
    }
  };
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-purple-600"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
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
        <div className="mb-6">
          <label className="block mb-1 text-gray-300">Password</label>
          <input
            type="password"
            className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition duration-300 cursor-pointer">
          Login
        </button>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Google Sign-Up Button */}
        <a
          href="http://localhost:5000/api/auth/google"
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 px-4 rounded-md border border-gray-300 shadow hover:bg-gray-100 hover:text-black transition duration-300"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="font-semibold text-sm">Sign up with Google</span>
        </a>
      </form>
    </div>
  );
}
