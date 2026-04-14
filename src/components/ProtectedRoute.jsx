import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const getUserRole = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
  const roles = allowedRoles || (allowedRole ? [allowedRole] : null);
  const token = localStorage.getItem("token");

  // 🔒 Not logged in
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole(token);

  // 🎭 Role check
  if (roles && !roles.includes(role)) {
    // redirect smartly
    if (role === "SYSTEM_ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === "VOLUNTEER") {
      return <Navigate to="/volunteer/profile" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
