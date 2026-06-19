import type { ReactNode } from "react";
import { TopNav } from "@/components/marketing/top-nav";
import { Footer } from "@/components/marketing/footer";
import { getSession } from "@/lib/auth";

/**
 * Marketing shell - sticky TopNav, content, Footer. The CTA is state-aware: it
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <TopNav isAuthed={Boolean(session)} />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
