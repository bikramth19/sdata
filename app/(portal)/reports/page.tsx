import { requirePagePermission } from "@/lib/page-guard";
import Reports from "@/components/Reports";
export default async function ReportsPage(){const user=await requirePagePermission("reports.view");return <Reports canExport={user.permissions.includes("reports.export")}/>;}
