import {requirePagePermission} from "@/lib/page-guard";
import Dashboard from "@/components/Dashboard";
export default async function DashboardPage(){await requirePagePermission("dashboard.view");return <Dashboard/>;}
