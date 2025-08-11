import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
  let user;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
  }

  const isAdmin = user?.role === "admin";
  const location = useLocation();

  return isAdmin ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
