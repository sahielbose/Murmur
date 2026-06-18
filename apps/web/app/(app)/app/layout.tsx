import type { ReactNode } from "react";

/**
 * Authenticated app shell. AppSidebar + AppTopBar are added in the next
 * commits; for now this is the dense app surface wrapper (MURMUR_UI.md §9).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen bg-bg text-fg">{children}</div>;
}
