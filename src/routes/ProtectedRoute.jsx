import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loading } from "../components/States.jsx";

export const homeFor = (user) => (user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard");

/** Guards a route tree. Pass `role` to restrict it to admins or members. */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Checking your session…" full />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}
