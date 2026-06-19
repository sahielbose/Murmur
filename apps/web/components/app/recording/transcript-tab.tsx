"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import type { TranscriptRow } from "@/lib/recordings";
import { useRecordingAudio } from "./recording-audio-provider";

type Turn = { speaker: string; segments: TranscriptRow[] };

function toTurns(rows: TranscriptRow[]): Turn[] {
  const turns: Turn[] = [];
  for (const row of rows) {
    const speaker = row.speaker ?? "Speaker";
    const last = turns[turns.length - 1];
    if (last && last.speaker === speaker) last.segments.push(row);
    else turns.push({ speaker, segments: [row] });
  }
  return turns;
}

/**
 * Transcript tab (MURMUR_UI.md §10.5): speaker-labeled turns with timestamps
 * that click-to-seek the audio. The currently-playing turn is highlighted.
 */
export function TranscriptTab({ rows }: { rows: TranscriptRow[] }) {
  const audio = useRecordingAudio();
  const activeRef = useRef<HTMLDivElement>(null);

  // Deep-link: scroll the linked moment into view on mount.
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, []);

  if (rows.length === 0) {
    return (
      <p className="py-6 text-sm text-fg-muted">
        The transcript appears once processing finishes.
      </p>
    );
  }

  const turns = toTurns(rows);
  const cur = audio?.currentMs ?? 0;

  // The active turn is the one containing `cur`, else the nearest turn at or
  // just before it (so a deep-linked timestamp highlights a single turn).
  let activeIndex = turns.findIndex(
    (t) =>
      cur >= t.segments[0]!.startMs &&
      cur < t.segments[t.segments.length - 1]!.endMs,
  );
  if (activeIndex === -1 && cur > 0) {
    for (let i = 0; i < turns.length; i++) {
      if (cur + 2000 >= turns[i]!.segments[0]!.startMs) activeIndex = i;
    }
  }

  return (
    <div className="divide-y divide-border">
      {turns.map((turn, i) => {
        const start = turn.segments[0]!.startMs;
        const active = i === activeIndex;
        return (
          <div
            key={i}
            ref={active ? activeRef : undefined}
            className={cn(
              "flex gap-4 px-2 py-3 transition-colors",
              active ? "bg-bg-subtle" : "",
            )}
          >
            <button
              type="button"
              onClick={() => audio?.seek(start)}
              className="mt-0.5 shrink-0 font-sans text-xs tabular-nums text-fg-subtle hover:text-fg"
              aria-label={`Play from ${formatTimestamp(start)}`}
            >
              {formatTimestamp(start)}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-medium text-fg">{turn.speaker}</p>
              <p className="mt-0.5 leading-relaxed text-fg">
                {turn.segments.map((s) => s.text).join(" ")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
