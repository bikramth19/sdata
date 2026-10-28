import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
export type Period = "daily" | "monthly" | "quarterly" | "yearly";
export function reportQuery(params: URLSearchParams): Prisma.StudentWhereInput {
  const search = (params.get("search") || "").trim().slice(0,100);
  const from = params.get("from");
  const to = params.get("to");
  const dateRange: {gte?: Date; lt?: Date} = {};
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) { const d = new Date(`${from}T00:00:00.000Z`); if (!isNaN(d.getTime())) dateRange.gte = d; }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) { const d = new Date(`${to}T00:00:00.000Z`); if (!isNaN(d.getTime())) dateRange.lt = new Date(d.getTime() + 86400000); }
  return {
    ...(Object.keys(dateRange).length ? { registeredAt: dateRange } : {}),
    ...(search ? { OR: [
      { firstName: { contains: search } }, { lastName: { contains: search } },
      { registrationNo: { contains: search } }, { email: { contains: search } },
      { phone: { contains: search } }, { program: { contains: search } }
    ] } : {})
  };
}
export async function fetchReport(params: URLSearchParams) {
  const where = reportQuery(params);
  return db.student.findMany({ where, orderBy: { registeredAt: "desc" }, take: 20000 });
}
export function groupReport(rows: {registeredAt: Date}[], period: Period) {
  const map = new Map<string,number>();
  for (const item of rows) {
    const d = item.registeredAt;
    const year = d.getUTCFullYear(), month = d.getUTCMonth() + 1;
    const key = period === "yearly" ? String(year)
      : period === "quarterly" ? `${year}-Q${Math.ceil(month / 3)}`
      : period === "monthly" ? `${year}-${String(month).padStart(2,"0")}`
      : d.toISOString().slice(0,10);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([label,count]) => ({label,count}));
}
