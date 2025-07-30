import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // RESET PASSWORD
  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/admins/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      setMessage(res.data.message || "Password Reset Successful.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleReset}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-purple-600"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-400 underline">
          Reset Password
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-gray-300">New Password</label>
          <input
            type="password"
            className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-300">Confirm Password</label>
          <input
            type="password"
            className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition duration-300 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-purple-300">{message}</p>
        )}
      </form>
    </div>
  );
}
