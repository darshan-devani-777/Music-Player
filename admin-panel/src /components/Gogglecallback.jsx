import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const encodedData = query.get("data");
    const error = query.get("error");

    if (error) {
      alert(decodeURIComponent(error));
      navigate("/login");
      return;
    }

    if (encodedData) {
      const { user, accessToken } = JSON.parse(decodeURIComponent(encodedData));

      if (user.role !== "admin") {
        alert("Only admin can login");
        navigate("/login");
      } else {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
        navigate("/dashboard");
      }
    }
  }, [location, navigate]);

  return <div className="text-white text-center mt-20">Logging in with Google...</div>;
}
