import { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await api.post("/auth/admins/forgot-password", {
        email,
      });
      setMessage(res.data.message || "Reset link sent to your email.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <form
        onSubmit={handleForgotPassword}
        className="p-7 rounded-lg shadow-lg w-96 border border-purple-600"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-600 underline">
          Forgot Password
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-black">Email:</label>
          <input
            type="email"
            className={`w-full bg-gray-100 text-gray-600 border px-3 py-2 rounded focus:outline-none focus:ring-1 ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-600 focus:ring-purple-400"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition duration-300 cursor-pointer">
          Send Reset Link
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-purple-300">{message}</p>
        )}
      </form>
    </div>
  );
}
