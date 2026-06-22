import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Closing CTA band (MURMUR_UI.md §13). */
export function ClosingCta({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Be present. Murmur remembers.
        </h2>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-white text-black hover:bg-white/90"
          >
            <Link href={isAuthed ? "/app" : "/signup"}>
              {isAuthed ? "Open app" : "Get started"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
