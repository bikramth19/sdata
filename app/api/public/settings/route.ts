import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  const s = await db.appSetting.findUnique({ where: { id:"global" }, select: { institutionName:true,publicRegistrationOpen:true } });
  return NextResponse.json(s ?? { institutionName:"Monoline",publicRegistrationOpen:false });
}
