export const ALL_PERMISSIONS = [
  "dashboard.view", "students.view", "students.create", "students.edit", "students.delete",
  "reports.view", "reports.export", "users.manage", "roles.manage",
  "settings.manage", "notifications.view"
] as const;
export type Permission = typeof ALL_PERMISSIONS[number];
export const PERMISSION_LABELS: Record<Permission,string> = {
  "dashboard.view": "View dashboard", "students.view": "View students", "students.create": "Add students",
  "students.edit": "Edit / disable students", "students.delete": "Delete students",
  "reports.view": "View reports", "reports.export": "Export Excel / PDF",
  "users.manage": "Manage users", "roles.manage": "Manage roles and permissions",
  "settings.manage": "Manage settings", "notifications.view": "View notifications"
};
export function parsePermissions(json: string): string[] {
  try { const p = JSON.parse(json); return Array.isArray(p) ? p.filter((s): s is string => typeof s === "string") : []; }
  catch { return []; }
}
