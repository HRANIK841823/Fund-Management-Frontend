import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import api, { errorMessage } from "../../api/client.js";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import PasswordInput from "../../components/PasswordInput.jsx";
import { EmptyState, ErrorBox, Loading } from "../../components/States.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import { fmtDate, money } from "../../utils/format.js";

const EMPTY = { name: "", username: "", email: "", password: "" };

export default function Members() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.get("/admin/members"));
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((m) => [m.name, m.username, m.email].some((v) => v.toLowerCase().includes(q)));
  }, [data, query]);

  const create = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await api.post("/admin/members", form);
      toast.success(`Account created for ${res.data.name}.`);
      setForm(EMPTY);
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/members/${toDelete.id}`);
      toast.success(res.data.message);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Members"
        description="Create accounts and share the login details with each member. There is no public sign-up."
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            <Plus className="size-4" aria-hidden /> {showForm ? "Close form" : "Add member"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={create} className="card mb-6 p-5 sm:p-6" noValidate>
          <h2 className="mb-4 text-base font-bold text-slate-900">New member</h2>
          {formError && (
            <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="m-name" className="label">Full name</label>
              <input id="m-name" className="input" value={form.name} onChange={(e) => set("name")(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="m-username" className="label">Username</label>
              <input id="m-username" className="input" value={form.username} onChange={(e) => set("username")(e.target.value)} autoCapitalize="none" required />
              <p className="mt-1 text-xs text-slate-500">Letters, numbers, dot, dash or underscore.</p>
            </div>
            <div>
              <label htmlFor="m-email" className="label">Email</label>
              <input id="m-email" type="email" className="input" value={form.email} onChange={(e) => set("email")(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="m-password" className="label">Temporary password</label>
              <PasswordInput id="m-password" value={form.password} onChange={set("password")} autoComplete="new-password" />
              <p className="mt-1 text-xs text-slate-500">At least 8 characters. The member can change it after logging in.</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create account"}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setFormError(""); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-3">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <label htmlFor="member-search" className="sr-only">Search members</label>
            <input id="member-search" className="input pl-9" placeholder="Search name, username or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {loading && !data ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={data.length === 0 ? "No members yet" : "No matching members"}
            hint={data.length === 0 ? "Use “Add member” to create the first account." : "Try a different search."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  {["Name", "Username", "Email", "Approved total", "Pending", "Joined", ""].map((h, i) => (
                    <th key={i} className="th">{h || <span className="sr-only">Actions</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="td font-semibold text-slate-900">{m.name}</td>
                    <td className="td">@{m.username}</td>
                    <td className="td">{m.email}</td>
                    <td className="td font-medium text-emerald-700">{money(m.approved_total)}</td>
                    <td className="td">{m.pending_count}</td>
                    <td className="td">{fmtDate(m.created_at)}</td>
                    <td className="td text-right">
                      <button className="btn btn-secondary px-2.5 py-1.5 text-red-700 hover:bg-red-50" onClick={() => setToDelete(m)} aria-label={`Delete ${m.name}`}>
                        <Trash2 className="size-4" aria-hidden /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.name ?? "member"}?`}
        message="This permanently deletes the member and all of their payments. The fund total will go down by their approved amount. This cannot be undone."
        confirmLabel="Delete member"
        tone="danger"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </>
  );
}
