import { NextResponse } from "next/server";
import { authorized } from "@/lib/http";
import { fetchReport, groupReport, type Period } from "@/lib/reports";
export async function GET(req:Request) {
  const {error}=await authorized("reports.view"); if(error) return error;
  const params=new URL(req.url).searchParams;
  const selected=params.get("period") || "monthly";
  const period:Period=["daily","monthly","quarterly","yearly"].includes(selected) ? selected as Period : "monthly";
  const rows=await fetchReport(params);
  return NextResponse.json({rows:rows.slice(0,200),total:rows.length,groups:groupReport(rows,period),active:rows.filter(r=>r.status==="ACTIVE").length,period,truncated:rows.length>=20000});
}
