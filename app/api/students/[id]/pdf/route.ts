import { db } from "@/lib/db";
import { authorized, fail } from "@/lib/http";
import { studentPdf, pdfResponse } from "@/lib/pdf";
type Context={params:Promise<{id:string}>};
export async function GET(_req:Request,{params}:Context) {
  const {error}=await authorized("students.view"); if(error) return error;
  const student=await db.student.findUnique({where:{id:(await params).id}});
  if(!student) return fail("Student not found",404);
  const settings=await db.appSetting.findUnique({where:{id:"global"}});
  return pdfResponse(await studentPdf(student,settings?.institutionName),`${student.registrationNo}.pdf`);
}
