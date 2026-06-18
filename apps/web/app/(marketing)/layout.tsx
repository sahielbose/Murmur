import type { ReactNode } from "react";
import { TopNav } from "@/components/marketing/top-nav";
import { Footer } from "@/components/marketing/footer";

/**
 * Marketing shell — sticky TopNav, content, Footer. The state-aware CTA reads
 * the session in a later commit (mock dev auth).
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <TopNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
