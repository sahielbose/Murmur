import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Landing page (placeholder hero). The full marketing site — animated hero,
 * feature carousel, pricing, FAQ — is built in Phase 17. Copy is original
 * (MURMUR_UI.md §13).
 */
export default function LandingPage() {
  return (
    <main className="grid flex-1 place-items-center px-6 py-24">
      <div className="flex max-w-container-narrow flex-col items-center text-center">
        <span className="mb-6 text-[13px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
          Introducing Murmur
        </span>
        <h1 className="font-serif text-5xl font-bold tracking-[-0.03em] text-fg-strong sm:text-6xl">
          Remember every conversation.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-fg-muted">
          Murmur listens to the conversations that matter — meetings, calls,
          appointments — and turns them into clean notes, to-dos, and answers.
          Right in your browser.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
