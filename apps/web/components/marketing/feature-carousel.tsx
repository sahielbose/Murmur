"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  PenLine,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

function ActionPreview() {
  return (
    <div className="space-y-2">
      {["Email Marco the cabinet brand", "Schedule the fasting lab work"].map(
        (t) => (
          <span
            key={t}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/80"
          >
            <Check className="h-3.5 w-3.5 text-white" />
            {t}
          </span>
        ),
      )}
    </div>
  );
}

function AskPreview() {
  return (
    <div className="space-y-2 text-xs">
      <p className="ml-auto w-fit rounded-lg bg-white/15 px-3 py-1.5 text-white/90">
        What did we decide on pricing?
      </p>
      <p className="w-fit rounded-lg bg-white/5 px-3 py-1.5 text-white/70">
        You agreed on $29/mo.{" "}
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-black">
          12:04
        </span>
      </p>
    </div>
  );
}

function SummaryPreview() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {["Meeting notes", "Doctor's visit", "Sales call"].map((t, i) => (
        <span
          key={t}
          className={cn(
            "rounded-full px-3 py-1 text-xs",
            i === 0 ? "bg-white text-black" : "bg-white/10 text-white/70",
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

const FEATURES: {
  title: string;
  body: string;
  Icon: LucideIcon;
  preview: ReactNode;
}[] = [
  {
    title: "Turn talk into action.",
    body: "Murmur drafts the follow-up email, adds the to-dos, and queues the messages. You review and approve - it sends.",
    Icon: PenLine,
    preview: <ActionPreview />,
  },
  {
    title: "Ask your conversations anything.",
    body: "Every detail from every conversation, searchable and instant. Answers link straight to the moment it was said.",
    Icon: Sparkles,
    preview: <AskPreview />,
  },
  {
    title: "Summaries that fit how you work.",
    body: "Pick a style - meeting notes, a doctor's visit, a sales call - and regenerate anytime.",
    Icon: FileText,
    preview: <SummaryPreview />,
  },
];

export function FeatureCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  const scrollTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(FEATURES.length - 1, index));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) {
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: reduce ? "auto" : "smooth",
      });
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const children = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      children.forEach((c, i) => {
        const cardCenter = c.offsetLeft - track.offsetLeft + c.clientWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      setActive(nearest);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="features" className="bg-bg py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-fg-strong sm:text-4xl">
            Here&apos;s what makes it click.
          </h2>
          <div className="hidden gap-2 sm:flex">
            <CarouselButton
              label="Previous feature"
              disabled={active === 0}
              onClick={() => scrollTo(active - 1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </CarouselButton>
            <CarouselButton
              label="Next feature"
              disabled={active === FEATURES.length - 1}
              onClick={() => scrollTo(active + 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </CarouselButton>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Features"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollTo(active + 1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollTo(active - 1);
          }
        }}
        className={cn(
          "mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          FOCUS_RING,
        )}
      >
        {FEATURES.map(({ title, body, Icon, preview }, i) => (
          <article
            key={title}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${FEATURES.length}`}
            className="relative flex min-w-[85%] snap-center flex-col justify-between overflow-hidden rounded-3xl bg-black p-8 text-white sm:min-w-[460px]"
          >
            <Icon
              className="absolute right-6 top-6 h-10 w-10 text-white/15"
              strokeWidth={1.25}
              aria-hidden
            />
            <div>
              <h3 className="max-w-xs font-serif text-2xl tracking-tight">
                {title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
                {body}
              </p>
            </div>
            <div className="mt-8">{preview}</div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-2 flex max-w-5xl justify-center gap-2 px-6">
        {FEATURES.map((f, i) => (
          <button
            key={f.title}
            type="button"
            aria-label={`Go to feature ${i + 1}`}
            aria-current={active === i}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              active === i ? "w-6 bg-fg" : "w-2 bg-border-strong",
              FOCUS_RING,
            )}
          />
        ))}
      </div>
    </section>
  );
}

function CarouselButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg transition-colors hover:bg-bg-subtle disabled:opacity-30",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}
