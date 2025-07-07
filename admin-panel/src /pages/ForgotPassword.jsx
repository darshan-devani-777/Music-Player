import { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // FORGOT PASSWORD
  const handleForgotPassword = async (e) => {
    e.preventDefault();
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
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleForgotPassword}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-purple-600"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
          Forgot Password
        </h2>

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

        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition duration-300">
          Send Reset Link
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-purple-300">{message}</p>
        )}
      </form>
    </div>
  );
}
