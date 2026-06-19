import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopBar } from "@/components/app/app-topbar";
import { SearchCommand } from "@/components/app/search-command";
import { getSession } from "@/lib/auth";

/**
 * Authenticated app shell - sidebar rail + (top bar + content) column. Guarded
 * by the (mock) session; unauthenticated visitors are sent to /login.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = {
    name: session.user.name,
    email: session.user.email,
    plan: session.user.plan,
  };

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar user={user} />
        {children}
      </div>
      <SearchCommand />
    </div>
  );
}
