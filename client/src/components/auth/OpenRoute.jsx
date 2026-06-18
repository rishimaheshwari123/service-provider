import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function OpenRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return children;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }
  if (user?.role === "vendor") {
    return <Navigate to="/vendor/dashboard" />;
  }
  if (user?.role === "user") {
    return <Navigate to="/" />;
  }

  return <Navigate to="/" />;
}

export default OpenRoute;
