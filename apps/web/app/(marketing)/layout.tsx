import type { ReactNode } from "react";

/**
 * Marketing shell. Light surface; TopNav + Footer are added in the next commit.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">{children}</div>
  );
}
