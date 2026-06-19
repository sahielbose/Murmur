"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type OrbState = "idle" | "recording" | "paused";

/**
 * The RecordOrb (MURMUR_UI.md §10.2, §12). Idle = solid ink ring; recording =
 * breathing scale pulse + an expanding ring; tap scales down. Honors
 * prefers-reduced-motion.
 */
export function RecordOrb({
  state,
  onClick,
  disabled,
}: {
  state: OrbState;
  onClick: () => void;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const active = state === "recording";

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      {active && !reduce ? (
        <motion.span
          aria-hidden
          className="absolute h-40 w-40 rounded-full border-2 border-rec"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}

      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        aria-label={active ? "Stop recording" : "Start recording"}
        animate={active && !reduce ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={
          active && !reduce
            ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        whileTap={{ scale: 0.96 }}
        className={cn(
          "relative flex h-40 w-40 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50",
          active
            ? "border-rec bg-bg text-rec"
            : state === "paused"
              ? "border-border-strong bg-bg-subtle text-fg"
              : "border-fg-strong bg-fg-strong text-fg-inverse hover:bg-fg",
        )}
      >
        {active ? (
          <Square className="h-9 w-9" fill="currentColor" />
        ) : (
          <Mic className="h-10 w-10" />
        )}
      </motion.button>
    </div>
  );
}
