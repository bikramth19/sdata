import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized,fail,safeMutation } from "@/lib/http";
import { ALL_PERMISSIONS, parsePermissions } from "@/lib/permissions";
export async function GET() {
  const {error}=await authorized("roles.manage");if(error)return error;
  const roles=await db.role.findMany({include:{_count:{select:{users:true}}},orderBy:{createdAt:"asc"}});
  return NextResponse.json({roles:roles.map(r=>({...r,permissions:parsePermissions(r.permissions),users:r._count.users,_count:undefined}))});
}
export async function POST(req:Request) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error}=await authorized("roles.manage");if(error)return error;
  const data=await req.json().catch(() => ({}));
  if(typeof data.name!=="string"||data.name.trim().length<2||data.name.length>50||!Array.isArray(data.permissions)||!data.permissions.every((p:unknown)=>ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number])))return fail("Invalid role details");
  try {
    const role=await db.role.create({data:{name:data.name.trim(),description:typeof data.description==="string"?data.description.slice(0,250):"",permissions:JSON.stringify([...new Set(data.permissions)])}});
    return NextResponse.json({role},{status:201});
  } catch {return fail("Role name is already used",409);}
}
