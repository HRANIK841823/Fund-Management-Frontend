import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { errorMessage } from "../api/client.js";
import PasswordInput from "../components/PasswordInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { homeFor } from "../routes/ProtectedRoute.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(identifier.trim(), password);
      const from = location.state?.from;
      const allowed = from && from.startsWith(`/${u.role}`);
      navigate(allowed ? from : homeFor(u), { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not log in."));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden flex-col justify-between bg-brand-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-white/10">
            <Wallet className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">Fund Tracker</span>
        </div>
        <div>
          <p className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            Every monthly contribution, on the record.
          </p>
          <p className="mt-4 max-w-md text-base text-brand-100/80">
            Members submit what they paid. The admin confirms it. The group fund is always the sum of what has been confirmed.
          </p>
        </div>
        <p className="text-sm text-brand-100/60">Records only. No money moves through this site.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-800 text-white">
              <Wallet className="size-4" aria-hidden />
            </span>
            <span className="text-lg font-bold text-slate-900">Fund Tracker</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Log in</h1>
          <p className="mt-1 text-sm text-slate-500">Use the email or username your admin gave you.</p>

          {error && (
            <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="identifier" className="label">Email or username</label>
              <input
                id="identifier"
                className="input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-6 w-full py-2.5" disabled={busy || !identifier || !password}>
            {busy ? "Logging in…" : "Log in"}
          </button>
          <p className="mt-5 text-center text-xs text-slate-500">
            There is no sign-up. Ask your admin if you need an account.
          </p>
        </form>
      </section>
    </div>
  );
}
