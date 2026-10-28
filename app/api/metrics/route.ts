import { NextResponse } from "next/server";
import { authorized } from "@/lib/http";
import { db } from "@/lib/db";
export async function GET() {
  const {error}=await authorized("dashboard.view"); if(error) return error;
  const now=new Date(); const firstMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
  const startYear=new Date(Date.UTC(now.getUTCFullYear(),0,1));
  const [total, active, disabled, thisMonth, currentYear, programs, recent]=await Promise.all([
    db.student.count(),db.student.count({where:{status:"ACTIVE"}}),db.student.count({where:{status:"DISABLED"}}),
    db.student.count({where:{registeredAt:{gte:firstMonth}}}),
    db.student.findMany({where:{registeredAt:{gte:startYear}},select:{registeredAt:true}}),
    db.student.groupBy({by:["program"],_count:{_all:true},orderBy:{_count:{program:"desc"}},take:6}),
    db.student.findMany({take:6,orderBy:{registeredAt:"desc"},select:{id:true,firstName:true,lastName:true,registrationNo:true,program:true,registeredAt:true}})
  ]);
  const monthly=Array.from({length:12},(_,i)=>({month:new Date(Date.UTC(now.getUTCFullYear(),i,1)).toLocaleString("en-US",{month:"short",timeZone:"UTC"}),students:0}));
  for(const s of currentYear) monthly[s.registeredAt.getUTCMonth()].students++;
  return NextResponse.json({totals:{total,active,disabled,thisMonth},monthly,programs:programs.map(p=>({name:p.program,count:p._count._all})),recent});
}
