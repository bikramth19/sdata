import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { safeMutation, fail } from "@/lib/http";
import { setSession } from "@/lib/auth";
import { parsePermissions } from "@/lib/permissions";
export async function POST(req: Request) {
  if (!safeMutation(req)) return fail("Invalid request origin",403);
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password || email.length > 200 || password.length > 200) return fail("Invalid email or password",401);
  const user = await db.user.findUnique({ where: { email }, include: { role:true } });
  if (!user || !user.isActive || !await bcrypt.compare(password, user.passwordHash)) return fail("Invalid email or password",401);
  if (body.scope === "admin" && !parsePermissions(user.role.permissions).includes("users.manage")) return fail("Administrator access required",403);
  await setSession(user.id, user.tokenVersion);
  return NextResponse.json({ ok:true, redirect: parsePermissions(user.role.permissions).includes("dashboard.view") ? "/dashboard" : "/students" });
}
