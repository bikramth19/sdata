import { NextResponse } from "next/server";
import { getCurrentUser, can } from "@/lib/auth";

export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
export function safeMutation(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const url = new URL(req.url);
    const forwardedHost = req.headers.get("x-forwarded-host");
    return origin === url.origin || (!!forwardedHost && new URL(origin).host === forwardedHost);
  } catch { return false; }
}
export async function authorized(permission: string) {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: fail("Authentication required", 401) };
  if (!can(user, permission)) return { user: null, error: fail("Permission denied", 403) };
  return { user, error: null };
}
export function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
