"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  UsersRound,
  UserCheck,
  UserX,
  Eye,
  Pencil,
  Trash2,
  Download,
  Power,
  Filter,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  Drawer,
  PageHead,
  StatCard,
  StatusPill,
  Pagination,
  EmptyState,
  api,
  post,
  humanDate,
  ErrorMessage,
} from "@/components/ui";
import { StudentForm, StudentInput } from "@/components/StudentForm";
type Student = StudentInput & {
  id: string;
  registrationNo: string;
  status: string;
  registeredAt: string;
  source: string;
};
type Data = {
  students: Student[];
  total: number;
  page: number;
  size: number;
  totals: { all: number; active: number; disabled: number };
};
export default function Students({ permissions }: { permissions: string[] }) {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || ""),
    [applied, setApplied] = useState(params.get("search") || ""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1);
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"new" | "view" | "edit" | null>(null),
    [selected, setSelected] = useState<Student | null>(null),
    [mutationError, setMutationError] = useState("");
  const mayCreate = permissions.includes("students.create"),
    mayEdit = permissions.includes("students.edit"),
    mayDelete = permissions.includes("students.delete");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({ page: String(page), size: "10" });
      if (applied) q.set("search", applied);
      if (status) q.set("status", status);
      setData(await api<Data>(`/api/students?${q}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load students");
    } finally {
      setLoading(false);
    }
  }, [page, applied, status]);
  useEffect(() => {
    void load();
  }, [load]);
  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setApplied(search);
  }
  async function save(input: StudentInput) {
    if (mode === "edit" && selected) {
      await post(`/api/students/${selected.id}`, input, "PATCH");
    } else {
      await post("/api/students", input);
    }
    setMode(null);
    setSelected(null);
    await load();
  }
  async function toggle(student: Student) {
    setMutationError("");
    try {
      await post(
        `/api/students/${student.id}`,
        { status: student.status === "ACTIVE" ? "DISABLED" : "ACTIVE" },
        "PATCH",
      );
      await load();
    } catch (e) {
      setMutationError(
        e instanceof Error ? e.message : "Could not update status",
      );
    }
  }
  async function remove(student: Student) {
    if (
      !window.confirm(
        `Permanently delete ${student.firstName} ${student.lastName} (${student.registrationNo})? This cannot be undone.`,
      )
    )
      return;
    setMutationError("");
    try {
      await api(`/api/students/${student.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Unable to delete");
    }
  }
  const fieldRows = selected
    ? [
        ["Registration ID", selected.registrationNo],
        ["Full name", `${selected.firstName} ${selected.lastName}`],
        ["Email", selected.email],
        ["Phone", selected.phone],
        ["Date of birth", selected.dateOfBirth],
        ["Gender", selected.gender],
        ["Program", selected.program],
        ["Guardian", selected.guardianName],
        ["Guardian phone", selected.guardianPhone],
        ["Address", selected.address],
        ["Notes", selected.notes],
        ["Source", selected.source],
        ["Registered", humanDate(selected.registeredAt)],
      ]
    : [];
  return (
    <>
      <PageHead
        eyebrow=""
        title="Students"
        description="Manage student records, registrations and enrollments."
        action={
          mayCreate ? (
            <button
              className="button primary"
              onClick={() => {
                setSelected(null);
                setMode("new");
              }}
            >
              <Plus size={17} /> Add new student
            </button>
          ) : undefined
        }
      />
      <div className="stat-grid three">
        <StatCard
          label="Total students"
          value={data?.totals.all ?? "—"}
          icon={<UsersRound size={18} />}
          note="All registered students"
        />
        <StatCard
          label="Active students"
          value={data?.totals.active ?? "—"}
          icon={<UserCheck size={18} />}
          note="Active records"
        />
        <StatCard
          label="Disabled students"
          value={data?.totals.disabled ?? "—"}
          icon={<UserX size={18} />}
          note="Disabled records"
        />
      </div>
      <section className="panel list-panel">
        <div className="panel-header list-header">
          <div className="list-heading">
            <h2>
              All students{" "}
              <span className="count-chip">{data?.total ?? 0}</span>
            </h2>
            <p>View, edit, export or manage student profiles.</p>
          </div>
          <div className="table-toolbar">
            <form className="search-field" onSubmit={applySearch}>
              <Search size={17} />
              <input
                aria-label="Search student records"
                placeholder="Search by name, email, ID or program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
            <div className="select-filter">
              <Filter size={16} />
              <select
                value={status}
                aria-label="Filter by status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>
        </div>
        <ErrorMessage message={error || mutationError} />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>REGISTRATION ID</th>
                <th>PROGRAM</th>
                <th>REGISTERED</th>
                <th>STATUS</th>
                <th className="align-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {data?.students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="student-name">
                      <span className="table-avatar">
                        {s.firstName.charAt(0)}
                        {s.lastName.charAt(0)}
                      </span>
                      <div>
                        <strong>
                          {s.firstName} {s.lastName}
                        </strong>
                        <small>{s.email || s.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{s.registrationNo}</td>
                  <td>{s.program}</td>
                  <td>{humanDate(s.registeredAt)}</td>
                  <td>
                    <StatusPill status={s.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        title="View student"
                        aria-label="View student"
                        onClick={() => {
                          setSelected(s);
                          setMode("view");
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {mayEdit && (
                        <button
                          title="Edit student"
                          aria-label="Edit student"
                          onClick={() => {
                            setSelected(s);
                            setMode("edit");
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <a
                        href={`/api/students/${s.id}/pdf`}
                        title="Download PDF"
                        aria-label="Download student PDF"
                      >
                        <Download size={16} />
                      </a>
                      {mayEdit && (
                        <button
                          title={
                            s.status === "ACTIVE"
                              ? "Disable student"
                              : "Activate student"
                          }
                          aria-label="Toggle student status"
                          onClick={() => toggle(s)}
                        >
                          <Power size={16} />
                        </button>
                      )}
                      {mayDelete && (
                        <button
                          title="Delete student"
                          aria-label="Delete student"
                          className="danger-action"
                          onClick={() => remove(s)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data?.students.length && (
          <EmptyState
            title={
              loading ? "Loading student records..." : "No matching students"
            }
            description="Try a different search or add a new student."
          />
        )}
        <Pagination
          page={page}
          size={10}
          total={data?.total ?? 0}
          onChange={setPage}
        />
      </section>
      <Drawer
        open={mode !== null}
        onClose={() => setMode(null)}
        title={
          mode === "new"
            ? "Add new student"
            : mode === "edit"
              ? "Edit student"
              : "Student profile"
        }
        subtitle={
          mode === "new"
            ? "Create a new enrollment record"
            : selected?.registrationNo
        }
      >
        {mode === "view" && selected ? (
          <div className="student-profile">
            <div className="profile-highlight">
              <div className="profile-avatar">
                {selected.firstName.charAt(0)}
                {selected.lastName.charAt(0)}
              </div>
              <h3>
                {selected.firstName} {selected.lastName}
              </h3>
              <span className="mono">{selected.registrationNo}</span>
              <StatusPill status={selected.status} />
            </div>
            <div className="details-list">
              {fieldRows.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}
            </div>
            <div className="drawer-bottom-actions">
              <a
                className="button secondary"
                href={`/api/students/${selected.id}/pdf`}
              >
                <Download size={16} /> Download PDF
              </a>
              {mayEdit && (
                <button
                  className="button primary"
                  onClick={() => setMode("edit")}
                >
                  <Pencil size={16} /> Edit student
                </button>
              )}
            </div>
          </div>
        ) : null}
        {mode === "new" && (
          <StudentForm
            onSave={save}
            cancel={() => setMode(null)}
            submitLabel="Create student"
          />
        )}
        {mode === "edit" && selected && (
          <StudentForm
            key={selected.id}
            initial={{
              firstName: selected.firstName,
              lastName: selected.lastName,
              email: selected.email || "",
              phone: selected.phone,
              dateOfBirth: selected.dateOfBirth || "",
              gender: selected.gender,
              program: selected.program,
              guardianName: selected.guardianName || "",
              guardianPhone: selected.guardianPhone || "",
              address: selected.address || "",
              notes: selected.notes || "",
            }}
            onSave={save}
            cancel={() => setMode(null)}
            submitLabel="Save changes"
          />
        )}
      </Drawer>
    </>
  );
}
