import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";

/**
 * Authenticated app shell — sidebar rail + content column. The AppTopBar is
 * added in the next commit (MURMUR_UI.md §9).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
