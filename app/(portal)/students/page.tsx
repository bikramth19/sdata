import {requirePagePermission} from "@/lib/page-guard";
import Students from "@/components/Students";
import { Suspense } from "react";
export default async function StudentsPage(){const user=await requirePagePermission("students.view");return <Suspense fallback={<p>Loading students...</p>}><Students permissions={user.permissions}/></Suspense>;}
