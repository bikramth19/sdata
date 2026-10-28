"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye,EyeOff,LockKeyhole,ArrowRight,Layers3 } from "lucide-react";
import { ErrorMessage,post } from "@/components/ui";
export default function LoginScreen({admin=false}:{admin?:boolean}){
  const [show,setShow]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{
    const result=await post<{redirect:string}>("/api/auth/login",{email,password,scope:admin?"admin":"staff"});
    router.push(result.redirect);router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Login failed");}finally{setBusy(false);}}
  return <div className="login-layout"><section className="login-left"><Link href="/" className="login-brand"><span className="brand-mark"><Layers3 size={17}/></span><strong>Monoline</strong></Link>
    <div className="login-center"><div className="login-form-area"><div className="login-heading"><span className="login-small-icon"><LockKeyhole size={17}/></span><h1>{admin?"Admin login":"Login to your account"}</h1><p>{admin?"Access the Monoline management workspace":"Enter your email below to login to your account"}</p></div>
      <form onSubmit={submit}><label className="field">Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="m@example.com"/></label>
        <div className="password-heading"><span>Password</span><span className="muted-text">{admin?"Administrator access":"Secure sign in"}</span></div>
        <div className="password-input"><input type={show?"text":"password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" onClick={()=>setShow(!show)} aria-label={show?"Hide password":"Show password"}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
        <ErrorMessage message={error}/><button type="submit" disabled={busy} className="button primary login-submit">{busy?"Signing in...":"Login"} <ArrowRight size={16}/></button>
      </form>
      <div className="login-divider"><span>Or continue with</span></div>
      <Link href={admin?"/login":"/admin/login"} className="button secondary login-alt">{admin?"Staff login":"Admin login"}</Link>
      <p className="login-bottom">Need to register a student? <Link href="/">Open registration form</Link></p>
      <p className="login-help">For new staff accounts, contact your administrator.</p>
    </div></div>
    <p className="login-footer">© {new Date().getFullYear()} Monoline. All rights reserved.</p>
  </section><aside className="login-art"><div className="art-rays"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-center"><Layers3 size={32}/></div></div><div className="art-caption"><span className="art-chip">MONOLINE WORKSPACE</span><h2>Student records,<br/>beautifully organized.</h2><p>A simpler way to manage every enrollment journey.</p></div></aside></div>;
}
