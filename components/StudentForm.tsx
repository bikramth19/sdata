"use client";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { ErrorMessage } from "@/components/ui";
export type StudentInput={
  firstName:string;lastName:string;email:string;phone:string;dateOfBirth:string;gender:string;program:string;
  guardianName:string;guardianPhone:string;address:string;notes:string;
};
export const blankStudent:StudentInput={firstName:"",lastName:"",email:"",phone:"",dateOfBirth:"",gender:"OTHER",program:"",guardianName:"",guardianPhone:"",address:"",notes:""};
export function StudentForm({initial=blankStudent,onSave,submitLabel="Register student",cancel}:{initial?:StudentInput,onSave:(input:StudentInput)=>Promise<void>,submitLabel?:string,cancel?:()=>void}){
  const [v,setV]=useState<StudentInput>(initial);
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  const set=(key:keyof StudentInput,value:string)=>setV(prev=>({...prev,[key]:value}));
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{await onSave(v);}catch(err){setError(err instanceof Error?err.message:"Please try again");}finally{setBusy(false);}}
  return <form onSubmit={submit} className="student-form">
    <div className="form-section"><div className="section-heading"><span className="step-count">01</span><div><h3>Personal information</h3><p>Basic information about the student</p></div></div>
      <div className="form-grid"><label className="field">First name <span className="required">*</span><input required maxLength={80} value={v.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="e.g. Aarav"/></label>
      <label className="field">Last name <span className="required">*</span><input required maxLength={80} value={v.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="e.g. Sharma"/></label>
      <label className="field">Email address<input type="email" maxLength={150} value={v.email} onChange={e=>set("email",e.target.value)} placeholder="student@example.com"/></label>
      <label className="field">Phone number <span className="required">*</span><input required minLength={6} maxLength={25} type="tel" value={v.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 98765 43210"/></label>
      <label className="field">Date of birth<input type="date" value={v.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)}/></label>
      <label className="field">Gender<select value={v.gender} onChange={e=>set("gender",e.target.value)}><option value="OTHER">Other</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option></select></label>
      </div></div>
    <div className="form-section"><div className="section-heading"><span className="step-count">02</span><div><h3>Academic details</h3><p>Enrollment and family information</p></div></div>
      <div className="form-grid"><label className="field full">Course / Program <span className="required">*</span><input required maxLength={120} value={v.program} onChange={e=>set("program",e.target.value)} placeholder="e.g. Bachelor of Computer Applications"/></label>
      <label className="field">Guardian name<input maxLength={100} value={v.guardianName} onChange={e=>set("guardianName",e.target.value)} placeholder="Full name"/></label>
      <label className="field">Guardian phone<input maxLength={25} value={v.guardianPhone} onChange={e=>set("guardianPhone",e.target.value)} placeholder="Contact number"/></label>
      <label className="field full">Address<textarea rows={3} maxLength={500} value={v.address} onChange={e=>set("address",e.target.value)} placeholder="Street, city, state and postal code"/></label>
      <label className="field full">Additional notes <span className="field-hint">Optional</span><textarea rows={3} maxLength={1000} value={v.notes} onChange={e=>set("notes",e.target.value)} placeholder="Anything else we should know?"/></label>
      </div></div>
    <ErrorMessage message={error}/>
    <div className="form-actions">{cancel&&<button type="button" className="button secondary" onClick={cancel}>Cancel</button>}<button className="button primary" type="submit" disabled={busy}>{busy?<Loader2 className="spin" size={17}/>:<Save size={16}/>} {busy?"Saving...":submitLabel}</button></div>
  </form>;
}
