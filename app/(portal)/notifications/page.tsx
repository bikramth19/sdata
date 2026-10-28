import {requirePagePermission} from "@/lib/page-guard";
import Notifications from "@/components/Notifications";
export default async function NotificationsPage(){await requirePagePermission("notifications.view");return <Notifications/>;}
