"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import {
  Drawer,
  PageHead,
  api,
  post,
  ErrorMessage,
  EmptyState,
} from "@/components/ui";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  Permission,
} from "@/lib/permissions";
type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  users: number;
};
export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]),
    [drawer, setDrawer] = useState(false),
    [selected, setSelected] = useState<Role | null>(null),
    [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [permissions, setPermissions] = useState<string[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setRoles((await api<{ roles: Role[] }>("/api/roles")).roles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load roles");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function edit(role: Role | null) {
    setSelected(role);
    setName(role?.name || "");
    setDescription(role?.description || "");
    setPermissions(role?.permissions || []);
    setError("");
    setDrawer(true);
  }
  function toggle(p: string) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((s) => s !== p) : [...prev, p],
    );
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post(
        selected ? `/api/roles/${selected.id}` : "/api/roles",
        { name, description, permissions },
        selected ? "PATCH" : "POST",
      );
      setDrawer(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save role");
    } finally {
      setBusy(false);
    }
  }
  async function remove(r: Role) {
    if (!confirm(`Delete role ${r.name}?`)) return;
    try {
      await api(`/api/roles/${r.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot delete role");
    }
  }
  return (
    <>
      <PageHead
        eyebrow=""
        title="Roles & permissions"
        description="Define what your team can see and do in Monoline."
        action={
          <button className="button primary" onClick={() => edit(null)}>
            <Plus size={17} /> Create role
          </button>
        }
      />
      <ErrorMessage message={drawer ? "" : error} />
      <div className="role-grid">
        {roles.map((r) => (
          <article className="panel role-card" key={r.id}>
            <div className="role-card-top">
              <span className="role-icon">
                <ShieldCheck size={21} />
              </span>
              {r.isSystem ? (
                <span className="system-chip">
                  <LockKeyhole size={12} /> System role
                </span>
              ) : (
                <div className="role-buttons">
                  <button
                    className="icon-button"
                    onClick={() => edit(r)}
                    title="Edit role"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => remove(r)}
                    title="Delete role"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <h2>{r.name}</h2>
            <p>{r.description || "Custom access configuration"}</p>
            <div className="role-footer">
              <span>
                <UsersRound size={15} />
                {r.users} users
              </span>
              <span>{r.permissions.length} permissions</span>
            </div>
          </article>
        ))}
      </div>
      <section className="panel permissions-reference">
        <div className="panel-header">
          <div>
            <h2>Permission catalog</h2>
            <p>
              Permissions determine access to features and actions across the
              platform.
            </p>
          </div>
        </div>
        <div className="permission-catalog">
          {ALL_PERMISSIONS.map((p) => (
            <div key={p}>
              <ShieldCheck size={16} />
              <strong>{PERMISSION_LABELS[p]}</strong>
              <code>{p}</code>
            </div>
          ))}
        </div>
      </section>
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={selected ? "Edit role" : "Create new role"}
        subtitle="Select the actions this role is allowed to perform"
      >
        <form onSubmit={save} className="drawer-form">
          <label className="field">
            Role name <span className="required">*</span>
            <input
              required
              minLength={2}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Admissions manager"
            />
          </label>
          <label className="field">
            Description
            <textarea
              rows={2}
              value={description}
              maxLength={250}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this role"
            />
          </label>
          <div className="permission-chooser">
            <div>
              <h3>Access permissions</h3>
              <p>Choose the modules and actions available for this role.</p>
            </div>
            {ALL_PERMISSIONS.map((p) => (
              <label className="permission-check" key={p}>
                <span>
                  <strong>{PERMISSION_LABELS[p]}</strong>
                  <small>{p}</small>
                </span>
                <input
                  type="checkbox"
                  checked={permissions.includes(p)}
                  onChange={() => toggle(p)}
                />
              </label>
            ))}
          </div>
          <ErrorMessage message={error} />
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setDrawer(false)}
            >
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={busy}>
              {busy ? "Saving..." : "Save role"}
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
