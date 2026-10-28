import { NextResponse } from "next/server";
import { studentSchema } from "@/lib/validation";
import { registerStudent } from "@/lib/registration";
import { fail, safeMutation } from "@/lib/http";
// Development-only, per-process anti-abuse limit; use a shared limiter + CAPTCHA in production.
const requests = new Map<string,{count:number,expires:number}>();
export async function POST(req: Request) {
  if (!safeMutation(req)) return fail("Invalid request origin",403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now=Date.now();
  if (requests.size > 3000) for (const [k,v] of requests) if(v.expires < now) requests.delete(k);
  const counter=requests.get(ip);
  const current=counter && counter.expires>now ? counter : {count:0,expires:now+3600000};
  if (++current.count > 15) return fail("Too many registrations. Please try again later.",429);
  requests.set(ip,current);
  const parsed=studentSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid student information",422);
  try {
    const student=await registerStudent(parsed.data,"PUBLIC");
    return NextResponse.json({ok:true,id:student.id,registrationNo:student.registrationNo}, {status:201});
  } catch (e) {
    return fail(e instanceof Error && e.message.includes("closed") ? e.message : "Unable to register. Please contact the administrator.", 409);
  }
}
