"use client";

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

  if (rows.length === 0) {
    return (
      <p className="py-6 text-sm text-fg-muted">
        The transcript appears once processing finishes.
      </p>
    );
  }

  const turns = toTurns(rows);

  return (
    <div className="divide-y divide-border">
      {turns.map((turn, i) => {
        const start = turn.segments[0]!.startMs;
        const end = turn.segments[turn.segments.length - 1]!.endMs;
        const active =
          audio && audio.currentMs >= start && audio.currentMs < end;
        return (
          <div
            key={i}
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
