"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Scroll reveal — fade + settle up as the block enters the viewport
 * (MURMUR_UI.md §12). A scroll/IntersectionObserver trigger drives the reveal
 * for real users; an unconditional safety timer guarantees content is never
 * left hidden if those don't fire. Honours prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce) {
      setShown(true);
      return;
    }

    // Backstop first: content reveals even if scroll/IO never fire.
    const safety = window.setTimeout(() => setShown(true), 1500);
    let io: IntersectionObserver | undefined;

    const el = ref.current;
    const inView = () => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };

    const cleanup = () => {
      window.clearTimeout(safety);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const arm = () => {
      setShown(true);
      cleanup();
    };
    const onScroll = () => {
      if (inView()) arm();
    };

    if (inView()) {
      arm();
      return cleanup;
    }

    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) arm();
        },
        { threshold: 0.15 },
      );
      io.observe(el);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, [reduce]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
