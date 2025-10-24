import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role === "admin") {
    return children;
  } else if (user?.role === "vendor" || user?.role === "user") {
    return children;
  }

  return <Navigate to="/" />;
}

export default PrivateRoute;
