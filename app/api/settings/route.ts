import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized,fail,safeMutation } from "@/lib/http";
import { settingSchema } from "@/lib/validation";
import { formatRegistration } from "@/lib/registration";
export async function GET() {
  const {error}=await authorized("settings.manage");if(error)return error;
  const settings=await db.appSetting.findUnique({where:{id:"global"}});
  return NextResponse.json({settings,preview:settings?formatRegistration(settings,settings.nextRegistrationNumber):""});
}
export async function PATCH(req:Request) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error}=await authorized("settings.manage");if(error)return error;
  const parsed=settingSchema.safeParse(await req.json().catch(() => ({})));
  if(!parsed.success)return fail(parsed.error.issues[0]?.message||"Invalid settings",422);
  // Changing the format affects future records only; previously issued IDs remain unchanged.
  const settings=await db.appSetting.update({where:{id:"global"},data:parsed.data});
  return NextResponse.json({settings,preview:formatRegistration(settings,settings.nextRegistrationNumber)});
}
