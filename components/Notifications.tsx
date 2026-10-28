"use client";
import { useEffect,useState } from "react";
import { Bell,Check,GraduationCap,UserPlus,Info,CheckCheck } from "lucide-react";
import { PageHead,api,post,EmptyState,ErrorMessage } from "@/components/ui";
type Notice={id:string,title:string,message:string,type:string,createdAt:string,read:boolean};
export default function Notifications(){
  const [notices,setNotices]=useState<Notice[]>([]),[error,setError]=useState("");
  async function load(){try{setNotices((await api<{notifications:Notice[]}>("/api/notifications")).notifications);}catch(e){setError(e instanceof Error?e.message:"Could not load notifications");}}
  useEffect(()=>{void load();},[]);
  async function read(id:string){try{await post(`/api/notifications/${id}`,{},"PATCH");await load();}catch(e){setError(e instanceof Error?e.message:"Could not mark notification as read");}}
  async function readAll(){for(const n of notices.filter(x=>!x.read))await post(`/api/notifications/${n.id}`,{},"PATCH").catch(()=>{});await load();}
  return <><PageHead eyebrow="INBOX" title="Notifications" description="Stay informed about new registrations and workspace activity." action={<button className="button secondary" onClick={readAll} disabled={!notices.some(n=>!n.read)}><CheckCheck size={16}/> Mark all as read</button>}/><ErrorMessage message={error}/><section className="panel notification-page-panel"><div className="panel-header"><div><h2>All notifications <span className="count-chip">{notices.filter(n=>!n.read).length} unread</span></h2><p>Your latest activity and important updates.</p></div></div>{notices.map(n=><div className={`notification-item ${n.read?"":"unread"}`} key={n.id}><span className="notification-type-icon">{n.type==="REGISTRATION"?<GraduationCap size={20}/>:n.type==="USER"?<UserPlus size={20}/>:<Info size={20}/>}</span><div><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString("en-IN")}</small></div>{!n.read&&<button className="button secondary small" onClick={()=>read(n.id)}><Check size={15}/> Mark read</button>}</div>)}{!notices.length&&<EmptyState title="You're all caught up" description="New activity will show here when it happens."/>}</section></>;
}
