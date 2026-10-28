"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  UsersRound,
  Pencil,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  KeyRound,
} from "lucide-react";
import {
  Drawer,
  PageHead,
  StatCard,
  EmptyState,
  api,
  post,
  humanDate,
  ErrorMessage,
} from "@/components/ui";
type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roleId: string;
  role: { name: string };
  createdAt: string;
};
type Role = { id: string; name: string };
export default function Users() {
  const [users, setUsers] = useState<User[]>([]),
    [roles, setRoles] = useState<Role[]>([]),
    [error, setError] = useState(""),
    [drawer, setDrawer] = useState(false),
    [current, setCurrent] = useState<User | null>(null),
    [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    roleId: "",
    password: "",
    isActive: true,
  });
  async function load() {
    try {
      const r = await api<{ users: User[]; roles: Role[] }>("/api/users");
      setUsers(r.users);
      setRoles(r.roles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load users");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function open(user: User | null) {
    setCurrent(user);
    setForm(
      user
        ? {
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            password: "",
            isActive: user.isActive,
          }
        : {
            name: "",
            email: "",
            roleId: roles[0]?.id || "",
            password: "",
            isActive: true,
          },
    );
    setError("");
    setDrawer(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (current) {
        const data: any = {
          name: form.name,
          email: form.email,
          roleId: form.roleId,
          isActive: form.isActive,
        };
        if (form.password) data.password = form.password;
        await post(`/api/users/${current.id}`, data, "PATCH");
      } else await post("/api/users", form);
      setDrawer(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save user");
    } finally {
      setBusy(false);
    }
  }
  async function remove(u: User) {
    if (!confirm(`Delete user ${u.name}? This action cannot be undone.`))
      return;
    try {
      await api(`/api/users/${u.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot delete user");
    }
  }
  async function toggle(u: User) {
    try {
      await post(`/api/users/${u.id}`, { isActive: !u.isActive }, "PATCH");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot change user status");
    }
  }
  return (
    <>
      <PageHead
        eyebrow=""
        title="User management"
        description="Create, edit, disable and manage staff access."
        action={
          <button className="button primary" onClick={() => open(null)}>
            <Plus size={17} /> Add user
          </button>
        }
      />
      <div className="stat-grid three">
        <StatCard
          label="Total users"
          value={users.length}
          icon={<UsersRound size={18} />}
          note="All staff accounts"
        />
        <StatCard
          label="Active users"
          value={users.filter((u) => u.isActive).length}
          icon={<UserRoundCheck size={18} />}
          note="Enabled accounts"
        />
        <StatCard
          label="Disabled users"
          value={users.filter((u) => !u.isActive).length}
          icon={<UserRoundX size={18} />}
          note="Login access disabled"
        />
      </div>
      <ErrorMessage message={drawer ? "" : error} />
      <section className="panel list-panel">
        <div className="panel-header">
          <div>
            <h2>
              Team members <span className="count-chip">{users.length}</span>
            </h2>
            <p>Role-based access for everyone in your organization.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>JOINED</th>
                <th className="align-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="student-name">
                      <span className="table-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-chip">{u.role.name}</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${u.isActive ? "status-active" : "status-disabled"}`}
                    >
                      <i />
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>{humanDate(u.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button title="Edit user" onClick={() => open(u)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        title={u.isActive ? "Disable user" : "Enable user"}
                        onClick={() => toggle(u)}
                      >
                        <UserRoundX size={16} />
                      </button>
                      <button
                        className="danger-action"
                        title="Delete user"
                        onClick={() => remove(u)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!users.length && (
          <EmptyState
            title="No users found"
            description="Add the first staff member to your team."
          />
        )}
      </section>
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={current ? "Edit user" : "Add new user"}
        subtitle="Manage team access and credentials"
      >
        <form onSubmit={save} className="drawer-form">
          <label className="field">
            Full name <span className="required">*</span>
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </label>
          <label className="field">
            Email address <span className="required">*</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="staff@example.com"
            />
          </label>
          <label className="field">
            Role <span className="required">*</span>
            <select
              required
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {current
              ? "New password (leave blank to keep)"
              : "Temporary password"}{" "}
            {!current && <span className="required">*</span>}
            <div className="hint-input">
              <KeyRound size={17} />
              <input
                type="password"
                minLength={12}
                required={!current}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 12 characters"
              />
            </div>
          </label>
          {current && (
            <label className="switch-row">
              <span>
                <strong>Active account</strong>
                <small>Allow this user to sign in</small>
              </span>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
            </label>
          )}
          <ErrorMessage message={error} />
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setDrawer(false)}
            >
              Cancel
            </button>
            <button className="button primary" disabled={busy}>
              {busy ? "Saving..." : current ? "Save changes" : "Create user"}
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
