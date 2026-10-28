import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, safeMutation } from "@/lib/http";
import { clearSession } from "@/lib/auth";
export async function POST(req: Request) {
  if (!safeMutation(req)) return fail("Invalid request origin",403);
  const user = await getCurrentUser(); if (!user) return fail("Authentication required",401);
  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 128) return fail("New password must contain at least 12 characters");
  const dbUser = await db.user.findUnique({where:{id:user.id}});
  if (!dbUser || !await bcrypt.compare(currentPassword,dbUser.passwordHash)) return fail("Current password is incorrect",403);
  if (currentPassword === newPassword) return fail("Choose a different password");
  await db.user.update({where:{id:user.id},data:{passwordHash:await bcrypt.hash(newPassword,12),tokenVersion:{increment:1}}});
  await clearSession();
  return NextResponse.json({ok:true,message:"Password changed. Please sign in again."});
}
