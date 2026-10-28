"use client";
import { useEffect } from "react";
import { X, Search, AlertCircle } from "lucide-react";

export async function api<T=any>(path:string,init?:RequestInit):Promise<T> {
  const res=await fetch(path,{credentials:"same-origin",...init,headers:{...(init?.body?{"Content-Type":"application/json"}:{}),...init?.headers}});
  let payload:any;
  try {payload=await res.json();}catch{payload={};}
  if(!res.ok) throw new Error(payload.error||`Request failed (${res.status})`);
  return payload as T;
}
export const post=<T=any>(path:string,data:any,method="POST"):Promise<T>=>api<T>(path,{method,body:JSON.stringify(data)});
export function Drawer({open,onClose,title,subtitle,children,width="560px"}:{open:boolean,onClose:()=>void,title:string,subtitle?:string,children:React.ReactNode,width?:string}){
  useEffect(()=>{
    if(!open)return;
    const fn=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",fn);
    const previous=document.body.style.overflow;document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",fn);document.body.style.overflow=previous;};
  },[open,onClose]);
  if(!open)return null;
  return <div className="drawer-layer" role="presentation"><div className="drawer-scrim" onClick={onClose}/><section role="dialog" aria-modal="true" aria-label={title} className="drawer" style={{maxWidth:width}}>
    <header className="drawer-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button type="button" className="icon-button" onClick={onClose} aria-label="Close drawer"><X size={19}/></button></header>
    <div className="drawer-body">{children}</div>
  </section></div>;
}
export function PageHead({eyebrow,title,description,action}:{eyebrow?:string,title:string,description?:string,action?:React.ReactNode}){
  return <div className="page-heading"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p className="page-subtitle">{description}</p>}</div>{action&&<div className="heading-action">{action}</div>}</div>;
}
export function StatCard({label,value,note,icon}:{label:string,value:string|number,note?:string,icon:React.ReactNode}){
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><p>{note||"Current totals"}</p></article>;
}
export function EmptyState({title="Nothing here yet",description="Records will appear here when available."}:{title?:string,description?:string}){
  return <div className="empty-state"><span className="empty-illustration"><Search size={22}/></span><h3>{title}</h3><p>{description}</p></div>;
}
export function ErrorMessage({message}:{message?:string}) {return message?<p role="alert" className="error-box"><AlertCircle size={15}/>{message}</p>:null;}
export const humanDate=(value:string|Date)=>new Date(value).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
export function StatusPill({status}:{status:string}) {return <span className={`status-pill ${status==="ACTIVE"?"status-active":"status-disabled"}`}><i/>{status==="ACTIVE"?"Active":"Disabled"}</span>;}
export function Pagination({page,total,size,onChange}:{page:number,total:number,size:number,onChange:(page:number)=>void}){
  const pages=Math.max(1,Math.ceil(total/size));
  return <div className="pagination"><small>Showing {total?(page-1)*size+1:0}–{Math.min(page*size,total)} of {total}</small><div><button className="button secondary small" disabled={page<=1} onClick={()=>onChange(page-1)}>Previous</button><span>Page {page} of {pages}</span><button className="button secondary small" disabled={page>=pages} onClick={()=>onChange(page+1)}>Next</button></div></div>;
}
