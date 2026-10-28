import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized,fail,safeMutation } from "@/lib/http";
import { ALL_PERMISSIONS } from "@/lib/permissions";
type Context={params:Promise<{id:string}>};
export async function PATCH(req:Request,{params}:Context) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error}=await authorized("roles.manage");if(error)return error;
  const id=(await params).id;
  const role=await db.role.findUnique({where:{id}});
  if(!role)return fail("Role not found",404);
  if(role.isSystem)return fail("Built-in roles cannot be modified",403);
  const data=await req.json().catch(() => ({}));
  if(typeof data.name!=="string"||data.name.trim().length<2||data.name.length>50||!Array.isArray(data.permissions)||!data.permissions.every((p:unknown)=>ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number])))return fail("Invalid role details");
  try {
    const updated=await db.role.update({where:{id},data:{name:data.name.trim(),description:typeof data.description==="string"?data.description.slice(0,250):"",permissions:JSON.stringify([...new Set(data.permissions)])}});
    return NextResponse.json({role:updated});
  }catch{return fail("Unable to update role",409);}
}
export async function DELETE(req:Request,{params}:Context) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error}=await authorized("roles.manage");if(error)return error;
  const id=(await params).id;
  const role=await db.role.findUnique({where:{id},include:{_count:{select:{users:true}}}});
  if(!role)return fail("Role not found",404);
  if(role.isSystem)return fail("Built-in roles cannot be deleted",403);
  if(role._count.users)return fail("Assign users to another role before deleting",409);
  await db.role.delete({where:{id}});
  return NextResponse.json({ok:true});
}
