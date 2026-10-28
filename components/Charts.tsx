"use client";
import { ResponsiveContainer,AreaChart,Area,CartesianGrid,XAxis,YAxis,Tooltip,BarChart,Bar,Cell,PieChart,Pie } from "recharts";
export function EnrollmentChart({data}:{data:{month:string,students:number}[]}){
  return <div className="chart-holder"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{top:14,right:12,bottom:0,left:-20}}><defs><linearGradient id="enrollArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#777a83" stopOpacity={0.22}/><stop offset="100%" stopColor="#777a83" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="month" tick={{fontSize:11,fill:"#92969f"}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fontSize:11,fill:"#92969f"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:10,border:"1px solid #e8e9ec",fontSize:12}}/><Area type="monotone" dataKey="students" name="Students" stroke="#292b30" strokeWidth={2.4} fill="url(#enrollArea)"/></AreaChart></ResponsiveContainer></div>;
}
export function ProgramChart({data}:{data:{name:string,count:number}[]}){
  const colors=["#30333a","#80858e","#b3b7be","#d8dbe1","#a2a7ae","#e9eaed"];
  if(!data.length)return <div className="chart-no-data">No program data yet.</div>;
  return <div className="program-chart"><div className="pie-graphic"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={57} outerRadius={83} paddingAngle={3} stroke="none">{data.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="program-legend">{data.map((p,i)=><div key={p.name}><span className="legend-dot" style={{background:colors[i%colors.length]}}/><span title={p.name}>{p.name}</span><strong>{p.count}</strong></div>)}</div></div>;
}
export function ReportChart({data}:{data:{label:string,count:number}[]}){
  return <div className="chart-holder"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{top:8,right:12,bottom:8,left:-20}}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="label" tick={{fontSize:10,fill:"#92969f"}} axisLine={false} tickLine={false} minTickGap={20}/><YAxis allowDecimals={false} tick={{fontSize:11,fill:"#92969f"}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="count" name="Registrations" fill="#35373d" radius={[5,5,0,0]} maxBarSize={42}/></BarChart></ResponsiveContainer></div>;
}
