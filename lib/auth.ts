import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { parsePermissions } from "@/lib/permissions";

const COOKIE = "monoline_session";
const secret = () => {
  const key = process.env.SESSION_SECRET;
  if (!key || key.length < 32 || key.includes("CHANGE_THIS")) throw new Error("SESSION_SECRET must be set to a secure random string (32+ characters).");
  return new TextEncoder().encode(key);
};
export async function createSession(userId: string, version: number) {
  return new SignJWT({ version }).setProtectedHeader({ alg: "HS256" })
    .setSubject(userId).setIssuedAt().setExpirationTime("12h").sign(secret());
}
export async function setSession(userId: string, version: number) {
  const cookie = await cookies();
  cookie.set(COOKIE, await createSession(userId, version), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12
  });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }
export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.version !== "number") return null;
    const user = await db.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
    if (!user || !user.isActive || user.tokenVersion !== payload.version) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role.name,
      permissions: parsePermissions(user.role.permissions) };
  } catch { return null; }
}
export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export function can(user: SessionUser | null, permission: string): boolean { return !!user?.permissions.includes(permission); }
