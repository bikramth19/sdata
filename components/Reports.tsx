"use client";
import { useEffect, useState } from "react";
import {
  CalendarRange,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  UsersRound,
  UserCheck,
  Activity,
} from "lucide-react";
import {
  PageHead,
  StatCard,
  api,
  humanDate,
  EmptyState,
  ErrorMessage,
} from "@/components/ui";
import { ReportChart } from "@/components/Charts";
type Report = {
  rows: {
    id: string;
    registrationNo: string;
    firstName: string;
    lastName: string;
    program: string;
    status: string;
    registeredAt: string;
  }[];
  total: number;
  active: number;
  groups: { label: string; count: number }[];
  truncated: boolean;
};
export default function Reports({ canExport }: { canExport: boolean }) {
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [period, setPeriod] = useState("monthly"),
    [search, setSearch] = useState("");
  const [query, setQuery] = useState("period=monthly"),
    [data, setData] = useState<Report | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api<Report>(`/api/reports?${query}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [query]);
  function apply(e: React.FormEvent) {
    e.preventDefault();
    if (from && to && from > to) {
      setError("Start date cannot be later than end date");
      return;
    }
    setError("");
    const q = new URLSearchParams({ period });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (search) q.set("search", search);
    setQuery(q.toString());
  }
  return (
    <>
      <PageHead
        eyebrow=""
        title="Registration reports"
        description="Explore enrollment trends, filter records, and export your data."
      />
      <section className="panel report-filter-panel">
        <form onSubmit={apply}>
          <div className="filter-grid">
            <label className="field">
              <span>From date</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="field">
              <span>To date</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Group by</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
            <label className="field">
              <span>Search</span>
              <input
                placeholder="Name, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button type="submit" className="button primary filter-submit">
              <Filter size={16} /> Apply filters
            </button>
          </div>
        </form>
      </section>
      <div className="report-summary-top">
        <div className="report-summary-cards">
          <StatCard
            label="Total registrations"
            value={data?.total ?? "—"}
            icon={<UsersRound size={18} />}
            note="Matching current filters"
          />
          <StatCard
            label="Active registrations"
            value={data?.active ?? "—"}
            icon={<UserCheck size={18} />}
            note="Active student records"
          />
          <StatCard
            label="Reporting periods"
            value={data?.groups.length ?? "—"}
            icon={<CalendarRange size={18} />}
            note={`Grouped by ${period}`}
          />
        </div>
        <div className="report-downloads">
          <span>EXPORT REPORT</span>
          {canExport ? (
            <>
              <a
                className="button secondary"
                href={`/api/reports/export?${query}&format=xlsx`}
              >
                <FileSpreadsheet size={16} /> Export Excel
              </a>
              <a
                className="button primary"
                href={`/api/reports/export?${query}&format=pdf`}
              >
                <FileText size={16} /> Export PDF
              </a>
            </>
          ) : (
            <small>Export permission required</small>
          )}
        </div>
      </div>
      <ErrorMessage message={error} />
      {data?.truncated && (
        <p className="info-box">
          Report processing is capped at 20,000 matching students. Narrow the
          dates to see the full set.
        </p>
      )}
      <section className="panel chart-panel report-chart">
        <div className="panel-header">
          <div>
            <h2>Registration trends</h2>
            <p>Number of students registered by selected {period} period</p>
          </div>
          <span className="panel-tag">
            <Activity size={14} /> {data?.total ?? 0} records
          </span>
        </div>
        {data?.groups.length ? (
          <ReportChart data={data.groups} />
        ) : (
          <EmptyState
            title="No report data"
            description="Choose a date range with student registrations to display the chart."
          />
        )}
      </section>
      <section className="panel list-panel">
        <div className="panel-header">
          <div>
            <h2>Student report data</h2>
            <p>
              Showing the first 200 matching records. Excel contains all
              matching rows up to the 20,000-record limit.
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>REGISTRATION ID</th>
                <th>STUDENT</th>
                <th>PROGRAM</th>
                <th>STATUS</th>
                <th>REGISTERED</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.registrationNo}</td>
                  <td>
                    <strong>
                      {s.firstName} {s.lastName}
                    </strong>
                  </td>
                  <td>{s.program}</td>
                  <td>{s.status === "ACTIVE" ? "Active" : "Disabled"}</td>
                  <td>{humanDate(s.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data?.rows.length && <EmptyState title="No registrations found" />}
      </section>
    </>
  );
}
