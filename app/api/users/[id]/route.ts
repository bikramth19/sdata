import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authorized,fail,safeMutation } from "@/lib/http";
type Context={params:Promise<{id:string}>};
export async function PATCH(req:Request,{params}:Context) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error,user:actor}=await authorized("users.manage");if(error)return error;
  const id=(await params).id;
  const current=await db.user.findUnique({where:{id},include:{role:true}});
  if(!current)return fail("User not found",404);
  const data=await req.json().catch(() => ({}));
  if(id===actor?.id && (data.isActive===false || (data.roleId && data.roleId!==current.roleId)))return fail("You cannot disable or change your own role",403);
  if(data.name!==undefined && (typeof data.name!=="string"||data.name.trim().length<2||data.name.length>100))return fail("Invalid name");
  if(data.email!==undefined && (typeof data.email!=="string"||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)))return fail("Invalid email");
  if(data.isActive!==undefined && typeof data.isActive!=="boolean")return fail("Invalid active status");
  if(data.roleId!==undefined && !await db.role.findUnique({where:{id:data.roleId}}))return fail("Role not found");
  if(data.password!==undefined && (typeof data.password!=="string"||data.password.length<12||data.password.length>128))return fail("Password must be at least 12 characters");
  try {
    await db.user.update({where:{id},data:{
      ...(data.name!==undefined?{name:data.name.trim()}:{}),
      ...(data.email!==undefined?{email:data.email.toLowerCase().trim()}:{}),
      ...(data.isActive!==undefined?{isActive:data.isActive}:{}),
      ...(data.roleId!==undefined?{roleId:data.roleId}:{}),
      ...(data.password!==undefined?{passwordHash:await bcrypt.hash(data.password,12)}:{}),
      tokenVersion:{increment:1}
    }});
    return NextResponse.json({ok:true});
  } catch {return fail("Unable to update user. Email may already exist.",409);}
}
export async function DELETE(req:Request,{params}:Context) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error,user:actor}=await authorized("users.manage");if(error)return error;
  const id=(await params).id;
  if(id===actor?.id)return fail("You cannot delete your own account",403);
  const existing=await db.user.findUnique({where:{id}});if(!existing)return fail("User not found",404);
  await db.user.delete({where:{id}});
  return NextResponse.json({ok:true});
}
