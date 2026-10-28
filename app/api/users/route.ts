import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authorized,fail,safeMutation } from "@/lib/http";
import { userSchema } from "@/lib/validation";
export async function GET() {
  const {error}=await authorized("users.manage");if(error)return error;
  const [users,roles]=await Promise.all([
    db.user.findMany({select:{id:true,name:true,email:true,isActive:true,createdAt:true,roleId:true,role:{select:{name:true}}},orderBy:{createdAt:"desc"}}),
    db.role.findMany({select:{id:true,name:true},orderBy:{name:"asc"}})
  ]);
  return NextResponse.json({users,roles});
}
export async function POST(req:Request) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error}=await authorized("users.manage");if(error)return error;
  const parsed=userSchema.safeParse(await req.json().catch(() => ({})));
  if(!parsed.success) return fail(parsed.error.issues[0]?.message||"Invalid user data",422);
  const data=parsed.data;
  if(!await db.role.findUnique({where:{id:data.roleId}}))return fail("Role not found",404);
  if(await db.user.findUnique({where:{email:data.email.toLowerCase()}}))return fail("Email is already in use",409);
  const user=await db.user.create({data:{name:data.name,email:data.email.toLowerCase(),roleId:data.roleId,passwordHash:await bcrypt.hash(data.password,12)}});
  await db.notification.create({data:{title:"User account created",message:`${user.name} was added as a user`,type:"USER"}});
  return NextResponse.json({ok:true,id:user.id},{status:201});
}
