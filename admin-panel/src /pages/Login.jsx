import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import { decryptData } from "../api/crypto";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); 

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

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // LOGIN USER
  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({});

    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(email.trim()))
      newErrors.email = "Please enter a valid email address.";

    if (!password.trim()) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.post("/auth/users/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, encryptedUserData, iv, key } =
        res.data.data;

      const decryptedUser = decryptData(encryptedUserData, iv, key);

      if (decryptedUser?.role !== "admin") {
        toast.error("Only Admins are allowed.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }

      toast.success("Logged in successfully!");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(decryptedUser));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const resData = err?.response?.data;
      console.log("Backend error response:", resData);

      if (resData?.errors && typeof resData.errors === "object") {
        Object.values(resData.errors).forEach((msg) => {
          toast.error(msg);
        });
      } else if (resData?.message) {
        toast.error(resData.message);
      } else {
        toast.error("Login failed");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-white">
      <form
        onSubmit={handleLogin}
        className="p-8 rounded-lg shadow-lg w-96 border border-purple-600"
        noValidate
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-600 underline">
          Admin Login
        </h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block mb-1 text-black">Email:</label>
          <input
            type="email"
            className={`w-full bg-gray-100 text-gray-600 border px-3 py-2 rounded focus:outline-none focus:ring-1 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-600 focus:ring-purple-400"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="">
          <label className="block mb-1 text-black">Password:</label>
          <input
            type="password"
            className={`w-full bg-gray-100 text-gray-600 border px-3 py-2 rounded focus:outline-none focus:ring-1 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-600 focus:ring-purple-300"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="mb-4 text-right">
          <Link
            to="/forgot-password"
            className="text-[12px] text-purple-600 hover:text-purple-500 transition duration-200"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition duration-300 cursor-pointer">
          Login
        </button>
      </form>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
