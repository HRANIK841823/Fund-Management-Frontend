import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarCheck, CalendarRange, ClipboardCheck, History, KeyRound, LayoutDashboard,
  LogOut, Menu, ReceiptText, Send, Settings, Users, Wallet, X,
} from "lucide-react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/approvals", label: "Payment Approvals", icon: ClipboardCheck, badge: true },
  { to: "/admin/payments", label: "All Payments", icon: ReceiptText },
  { to: "/admin/reports", label: "Monthly Reports", icon: CalendarRange },
  { to: "/admin/settings", label: "Fund Settings", icon: Settings },
  { to: "/admin/password", label: "Change Password", icon: KeyRound },
];

const MEMBER_NAV = [
  { to: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/member/submit", label: "Submit Payment", icon: Send },
  { to: "/member/history", label: "My Payment History", icon: History },
  { to: "/member/status", label: "My Monthly Status", icon: CalendarCheck },
  { to: "/member/password", label: "Change Password", icon: KeyRound },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const isAdmin = user.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : MEMBER_NAV;

  // Admin: keep the "pending submissions" indicator fresh on every page change.
  const refreshPending = useCallback(() => {
    if (!isAdmin) return;
    api.get("/admin/dashboard").then((res) => setPending(res.data.pending_count)).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    refreshPending();
    setOpen(false);
  }, [location.pathname, refreshPending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-md bg-brand-800 text-white">
          <Wallet className="size-4" aria-hidden />
        </span>
        <span className="text-base font-bold tracking-tight text-slate-900">Fund Tracker</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main">
        {nav.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge && pending > 0 && (
              <span
                className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white"
                aria-label={`${pending} pending submissions`}
              >
                {pending}
              </span>
            )}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="size-4 shrink-0" aria-hidden />
          Logout
        </button>
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{isAdmin ? "Administrator" : `@${user.username}`}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand-800 text-white">
            <Wallet className="size-4" aria-hidden />
          </span>
          <span className="font-bold text-slate-900">Fund Tracker</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu className="size-5" />
          {isAdmin && pending > 0 && <span className="absolute right-1 top-1 size-2.5 rounded-full bg-amber-500" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet context={{ refreshPending }} />
      </main>
    </div>
  );
}
