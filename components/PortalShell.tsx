"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  ChartNoAxesCombined,
  UsersRound,
  ShieldCheck,
  Settings2,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Layers3,
  Search,
  Check,
  Inbox,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { api, post, humanDate } from "@/components/ui";
type Notice = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};
const NAV = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    group: "WORKSPACE",
  },
  {
    title: "Students",
    href: "/students",
    icon: GraduationCap,
    permission: "students.view",
    group: "WORKSPACE",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
    permission: "reports.view",
    group: "WORKSPACE",
  },
  {
    title: "Users",
    href: "/users",
    icon: UsersRound,
    permission: "users.manage",
    group: "ADMINISTRATION",
  },
  {
    title: "Roles & permissions",
    href: "/roles",
    icon: ShieldCheck,
    permission: "roles.manage",
    group: "ADMINISTRATION",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    permission: "notifications.view",
    group: "ADMINISTRATION",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings2,
    permission: "",
    group: "ADMINISTRATION",
  },
];
export default function PortalShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname(),
    router = useRouter();
  const [theme, setTheme] = useState("light"),
    [mobile, setMobile] = useState(false),
    [notices, setNotices] = useState<Notice[]>([]),
    [showNotices, setShowNotices] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("monoline_theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.dataset.theme = "dark";
    }
  }, []);
  function toggleTheme() {
    const t = theme === "light" ? "dark" : "light";
    setTheme(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem("monoline_theme", t);
  }
  async function refreshNotices() {
    if (!user.permissions.includes("notifications.view")) return;
    try {
      const result = await api<{ notifications: Notice[] }>(
        "/api/notifications",
      );
      setNotices(result.notifications);
    } catch {}
  }
  useEffect(() => {
    void refreshNotices();
    const timer = setInterval(() => void refreshNotices(), 60000);
    return () => clearInterval(timer);
  }, []);
  async function logout() {
    await post("/api/auth/logout", {}).catch(() => {});
    router.push("/login");
    router.refresh();
  }
  async function markRead(id: string) {
    try {
      await post(`/api/notifications/${id}`, {}, "PATCH");
      await refreshNotices();
    } catch {}
  }
  const unread = notices.filter((n) => !n.read).length;
  const activeTitle =
    NAV.find((n) => n.href === pathname)?.title || "Workspace";
  return (
    <div className="portal-layout">
      <aside className={`portal-sidebar ${mobile ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <Link
            href="/dashboard"
            className="site-logo"
            onClick={() => setMobile(false)}
          >
            <span className="brand-mark">
              <Layers3 size={18} />
            </span>
            <span>
              Monoline<span className="brand-dot">.</span>
            </span>
          </Link>
          <button
            className="icon-button mobile-only"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>
        <nav className="side-nav">
          {["WORKSPACE", "ADMINISTRATION"].map((group) => (
            <div key={group} className="nav-group">
              <p>{group}</p>
              {NAV.filter(
                (n) =>
                  n.group === group &&
                  (!n.permission || user.permissions.includes(n.permission)),
              ).map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobile(false)}
                  className={`nav-link ${pathname === n.href ? "active" : ""}`}
                >
                  <n.icon size={18} />
                  {n.title}
                  {pathname === n.href && <span className="nav-selected" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <GraduationCap size={21} />
            <strong>Student enrollment</strong>
            <p>Manage your student community in one place.</p>
            <Link href="/">
              Open registration <ChevronRight size={14} />
            </Link>
          </div>
          <div className="side-user">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && (
        <div className="mobile-overlay" onClick={() => setMobile(false)} />
      )}
      <div className="portal-content">
        <header className="portal-topbar">
          <div className="top-left">
            <button
              className="icon-button mobile-only"
              onClick={() => setMobile(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={14} className="breadcrumb-chevron" />
            <span className="breadcrumb-current">{activeTitle}</span>
          </div>
          <div className="top-right">
            <div className="search-quick">
              <Search size={16} />
              <input
                placeholder="Search students..."
                aria-label="Search students"
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    router.push(
                      `/students?search=${encodeURIComponent(e.currentTarget.value)}`,
                    );
                }}
              />
            </div>
            <button
              className="icon-button toolbar-icon"
              onClick={toggleTheme}
              title={
                theme === "light" ? "Enable dark mode" : "Enable light mode"
              }
              aria-label="Toggle light/dark mode"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            {user.permissions.includes("notifications.view") && (
              <div className="notifications-menu">
                <button
                  className="icon-button toolbar-icon"
                  onClick={() => setShowNotices((v) => !v)}
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unread > 0 && (
                    <span className="notif-badge">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
                {showNotices && (
                  <div className="notif-popover">
                    <div className="notif-popover-head">
                      <strong>Notifications</strong>
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotices(false)}
                      >
                        View all
                      </Link>
                    </div>
                    {!notices.length ? (
                      <div className="notif-empty">
                        <Inbox size={23} />
                        No notifications yet
                      </div>
                    ) : (
                      notices.slice(0, 4).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`notif-popover-row ${n.read ? "" : "unread"}`}
                        >
                          <span className="notice-dot" />
                          <span>
                            <strong>{n.title}</strong>
                            <small>{n.message}</small>
                          </span>
                          {!n.read && <Check size={15} />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            <span className="top-separator" />
            <div className="top-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="top-user-details">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
          </div>
        </header>
        <main className="portal-main">{children}</main>
        <footer className="portal-footer">
          <span>© {new Date().getFullYear()} Monoline</span>
          <span>
            developed &amp; maintained by{" "}
            <a
              href="https://www.linkedin.com/in/bikram-thokchom-77b34778/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bikram SIngh
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
