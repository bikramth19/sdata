import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorized } from "@/lib/http";
export async function GET() {
  const {error,user}=await authorized("notifications.view");if(error)return error;
  const rows=await db.notification.findMany({take:100,orderBy:{createdAt:"desc"},include:{reads:{where:{userId:user!.id},select:{id:true}}}});
  const notifications=rows.map(({reads,...n})=>({...n,read:reads.length>0}));
  return NextResponse.json({notifications,unread:notifications.filter(n=>!n.read).length});
}
