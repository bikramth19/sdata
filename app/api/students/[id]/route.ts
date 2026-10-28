import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized, fail, safeMutation } from "@/lib/http";
import { studentSchema } from "@/lib/validation";
type Context = { params: Promise<{id:string}> };
export async function GET(_req:Request,{params}:Context) {
  const {error}=await authorized("students.view"); if(error) return error;
  const student=await db.student.findUnique({where:{id:(await params).id}});
  return student ? NextResponse.json({student}) : fail("Student not found",404);
}
export async function PATCH(req:Request,{params}:Context) {
  if(!safeMutation(req)) return fail("Invalid request origin",403);
  const {error}=await authorized("students.edit"); if(error) return error;
  const id=(await params).id;
  if(!await db.student.findUnique({where:{id},select:{id:true}})) return fail("Student not found",404);
  const payload=await req.json().catch(() => ({}));
  if (payload.status && Object.keys(payload).length===1) {
    if(!["ACTIVE","DISABLED"].includes(payload.status)) return fail("Invalid status");
    return NextResponse.json({student: await db.student.update({where:{id},data:{status:payload.status}})});
  }
  const parsed=studentSchema.safeParse(payload);
  if(!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid data",422);
  const s=parsed.data;
  const student=await db.student.update({where:{id},data:{...s,email:s.email||null,dateOfBirth:s.dateOfBirth||null,guardianName:s.guardianName||null,guardianPhone:s.guardianPhone||null,address:s.address||null,notes:s.notes||null}});
  return NextResponse.json({student});
}
export async function DELETE(req:Request,{params}:Context) {
  if(!safeMutation(req)) return fail("Invalid request origin",403);
  const {error}=await authorized("students.delete"); if(error) return error;
  const id=(await params).id;
  if(!await db.student.findUnique({where:{id},select:{id:true}})) return fail("Student not found",404);
  await db.student.delete({where:{id}});
  return NextResponse.json({ok:true});
}
