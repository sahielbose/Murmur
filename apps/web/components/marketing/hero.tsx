import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LiveDemo } from "./live-demo";

/**
 * Hero - black full-bleed (MURMUR_UI.md §7). Eyebrow → display headline → sub →
 * CTAs, with the coded live-demo panel as the centerpiece. Copy from §13.
 */
export function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-28 text-center sm:pt-32">
        <span className="mb-6 text-[13px] font-medium uppercase tracking-[0.12em] text-white/50">
          Introducing Murmur
        </span>
        <h1 className="max-w-3xl font-serif text-[40px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-6xl md:text-7xl">
          Remember every conversation.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
          Murmur listens to the conversations that matter - meetings, calls,
          appointments - and turns them into clean notes, to-dos, and answers.
          Right in your browser.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-white text-black hover:bg-white/90"
          >
            <Link href={isAuthed ? "/app" : "/signup"}>
              {isAuthed ? "Open app" : "Start free"}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        <div className="mt-16 w-full max-w-xl">
          <LiveDemo />
        </div>
      </div>
    </section>
  );
}
