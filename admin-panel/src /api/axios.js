import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("guestToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    const isExpired =
      status === 401 &&
      (message.includes("expired") || message.includes("over"));

    if (isExpired) {
      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("guestToken");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
