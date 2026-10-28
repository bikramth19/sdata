import {requirePagePermission} from "@/lib/page-guard";
import Users from "@/components/Users";
export default async function UsersPage(){await requirePagePermission("users.manage");return <Users/>;}
