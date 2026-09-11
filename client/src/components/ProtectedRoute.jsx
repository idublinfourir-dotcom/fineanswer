import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../pages/Provider/ContextProvider";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect non-admin users to regular dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
