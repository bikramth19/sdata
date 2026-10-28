import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized, fail, safeMutation } from "@/lib/http";
import { studentSchema } from "@/lib/validation";
import { registerStudent } from "@/lib/registration";
import { reportQuery } from "@/lib/reports";
export async function GET(req: Request) {
  const {error}=await authorized("students.view"); if(error) return error;
  const url = new URL(req.url);
  const page = Math.max(1,Math.min(Number(url.searchParams.get("page")) || 1,100000));
  const size = Math.max(1,Math.min(Number(url.searchParams.get("size")) || 10,100));
  const status = url.searchParams.get("status") || "";
  const where = { ...reportQuery(url.searchParams), ...(status === "ACTIVE" || status === "DISABLED" ? {status}: {}) };
  const [students, total, all, active, disabled] = await db.$transaction([
    db.student.findMany({where,orderBy:{registeredAt:"desc"},skip:(page-1)*size,take:size}),
    db.student.count({where}), db.student.count(),db.student.count({where:{status:"ACTIVE"}}),db.student.count({where:{status:"DISABLED"}})
  ]);
  return NextResponse.json({students,total,page,size,totals:{all,active,disabled}});
}
export async function POST(req: Request) {
  if (!safeMutation(req)) return fail("Invalid request origin",403);
  const {error}=await authorized("students.create"); if(error) return error;
  const parsed=studentSchema.safeParse(await req.json().catch(() => ({})));
  if(!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid student information",422);
  try {
    const student=await registerStudent(parsed.data,"STAFF");
    return NextResponse.json({student},{status:201});
  } catch { return fail("Registration number conflict. Check numbering settings.",409); }
}
