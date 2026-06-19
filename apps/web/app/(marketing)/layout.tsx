import type { ReactNode } from "react";
import { TopNav } from "@/components/marketing/top-nav";
import { Footer } from "@/components/marketing/footer";
import { getSession } from "@/lib/auth";

/**
 * Marketing shell — sticky TopNav, content, Footer. The CTA is state-aware: it
 * reads the (mock) session so logged-in visitors see "Open app".
 */
export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <TopNav isAuthed={Boolean(session)} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
