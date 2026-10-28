"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  UsersRound,
  UserCheck,
  UserX,
  CalendarDays,
  GraduationCap,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  PageHead,
  StatCard,
  api,
  humanDate,
  EmptyState,
} from "@/components/ui";
import { EnrollmentChart, ProgramChart } from "@/components/Charts";
type Metrics = {
  totals: {
    total: number;
    active: number;
    disabled: number;
    thisMonth: number;
  };
  monthly: { month: string; students: number }[];
  programs: { name: string; count: number }[];
  recent: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNo: string;
    program: string;
    registeredAt: string;
  }[];
};
export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api<Metrics>("/api/metrics")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <PageHead
        eyebrow="OVERVIEW"
        title="Dashboard"
        description="Welcome back. Here's what's happening with your students."
        action={
          <Link href="/students" className="button primary">
            <Plus size={17} /> Manage students
          </Link>
        }
      />
      {error && <p className="error-box">{error}</p>}
      <div className="stat-grid">
        <StatCard
          label="Total students"
          value={data?.totals.total ?? "—"}
          note="All registered students"
          icon={<UsersRound size={18} />}
        />
        <StatCard
          label="Active students"
          value={data?.totals.active ?? "—"}
          note="Currently active records"
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="This month"
          value={data?.totals.thisMonth ?? "—"}
          note="New registrations"
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="Disabled"
          value={data?.totals.disabled ?? "—"}
          note="Inactive student records"
          icon={<UserX size={18} />}
        />
      </div>
      <div className="dashboard-charts">
        <section className="panel chart-panel wide">
          <div className="panel-header">
            <div>
              <h2>Registration overview</h2>
              <p>Monthly student enrollment activity this year</p>
            </div>
            <span className="panel-tag">
              <Activity size={14} /> {new Date().getFullYear()}
            </span>
          </div>
          <EnrollmentChart
            data={
              data?.monthly ||
              Array.from({ length: 12 }, (_, i) => ({
                month: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ][i],
                students: 0,
              }))
            }
          />
        </section>
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Programs</h2>
              <p>Students by course / program</p>
            </div>
          </div>
          <ProgramChart data={data?.programs || []} />
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-header">
          <div>
            <h2>Recent registrations</h2>
            <p>Your newest student records</p>
          </div>
          <Link href="/students" className="text-link">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {data?.recent.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>REGISTRATION ID</th>
                  <th>PROGRAM</th>
                  <th>DATE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="student-name">
                        <span className="table-avatar">
                          {s.firstName.charAt(0)}
                          {s.lastName.charAt(0)}
                        </span>
                        <strong>
                          {s.firstName} {s.lastName}
                        </strong>
                      </div>
                    </td>
                    <td className="mono">{s.registrationNo}</td>
                    <td>{s.program}</td>
                    <td>{humanDate(s.registeredAt)}</td>
                    <td>
                      <Link href="/students" aria-label="Open students">
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No registrations yet"
            description="Student registrations will appear here when they're submitted."
          />
        )}
      </section>
    </>
  );
}
