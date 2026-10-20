import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute, { homeFor } from "./routes/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Members from "./pages/admin/Members.jsx";
import Payments from "./pages/admin/Payments.jsx";
import MonthlyReports from "./pages/admin/MonthlyReports.jsx";
import FundSettings from "./pages/admin/FundSettings.jsx";
import MemberDashboard from "./pages/member/MemberDashboard.jsx";
import SubmitPayment from "./pages/member/SubmitPayment.jsx";
import PaymentHistory from "./pages/member/PaymentHistory.jsx";
import MonthlyStatus from "./pages/member/MonthlyStatus.jsx";

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user) : "/login"} replace />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-lg font-bold text-slate-900">Page not found</p>
      <p className="text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go to my dashboard</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleHome />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="approvals" element={<Payments mode="approvals" />} />
        <Route path="payments" element={<Payments mode="all" />} />
        <Route path="reports" element={<MonthlyReports />} />
        <Route path="settings" element={<FundSettings />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      <Route
        path="/member"
        element={
          <ProtectedRoute role="member">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="submit" element={<SubmitPayment />} />
        <Route path="history" element={<PaymentHistory />} />
        <Route path="status" element={<MonthlyStatus />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
