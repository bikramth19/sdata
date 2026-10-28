import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { safeMutation, fail } from "@/lib/http";
export async function POST(req:Request) {
  if (!safeMutation(req)) return fail("Invalid request origin",403);
  await clearSession();
  return NextResponse.json({ok:true});
}
