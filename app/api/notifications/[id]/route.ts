import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized,fail,safeMutation } from "@/lib/http";
type Context={params:Promise<{id:string}>};
export async function PATCH(req:Request,{params}:Context) {
  if(!safeMutation(req))return fail("Invalid request origin",403);
  const {error,user}=await authorized("notifications.view");if(error)return error;
  const id=(await params).id;
  if(!await db.notification.findUnique({where:{id},select:{id:true}}))return fail("Notification not found",404);
  await db.notificationRead.upsert({where:{notificationId_userId:{notificationId:id,userId:user!.id}},update:{},create:{notificationId:id,userId:user!.id}});
  return NextResponse.json({ok:true});
}
