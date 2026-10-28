import { redirect } from "next/navigation";
import { getCurrentUser,can } from "@/lib/auth";
export async function requirePagePermission(permission:string){
  const user=await getCurrentUser();
  if(!user)redirect("/login");
  if(!can(user,permission))redirect("/settings");
  return user;
}
