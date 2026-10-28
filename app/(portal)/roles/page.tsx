import {requirePagePermission} from "@/lib/page-guard";
import Roles from "@/components/Roles";
export default async function RolesPage(){await requirePagePermission("roles.manage");return <Roles/>;}
