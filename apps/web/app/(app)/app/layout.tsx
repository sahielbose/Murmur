import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopBar } from "@/components/app/app-topbar";

/**
 * Authenticated app shell — sidebar rail + (top bar + content) column
 * (MURMUR_UI.md §9).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar />
        {children}
      </div>
    </div>
  );
}
