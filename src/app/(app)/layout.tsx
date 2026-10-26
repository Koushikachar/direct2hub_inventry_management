import { redirect } from "next/navigation";
import AppChrome from "@/components/AppChrome";
import { getUser, isOperator } from "@/lib/auth"; import { unreadCount } from "@/lib/notify";
export const metadata = { robots: { index: false, follow: false } }; // signed-in pages are never listed in search
/** Runs once per visit, not on every click: the sidebar, admin link and unread badge persist while only the page area changes. Each page still authorizes itself. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser(); if (!user) redirect("/login");
  const [admin, unread] = await Promise.all([isOperator(user), unreadCount()]);
  return <AppChrome admin={admin} unread={unread}>{children}</AppChrome>;
}
