"use client";

import { Pause, Play } from "lucide-react";
import { formatTimestamp } from "@/lib/format";
import { useRecordingAudio } from "./recording-audio-provider";

/** Audio player with a scrubber, synced to the transcript (MURMUR_UI.md §10.5). */
export function AudioPlayerBar() {
  const audio = useRecordingAudio();

  if (!audio || !audio.hasAudio) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-fg-subtle">
        Audio isn&apos;t available for this recording.
      </div>
    );
  }

  const { currentMs, durationMs, playing, seek, toggle } = audio;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated px-3 py-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {playing ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4" fill="currentColor" />
        )}
      </button>
      <span className="w-10 text-right text-xs tabular-nums text-fg-muted">
        {formatTimestamp(currentMs)}
      </span>
      <input
        type="range"
        min={0}
        max={Math.max(1, durationMs)}
        value={Math.min(currentMs, durationMs)}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Seek"
        className="h-1 flex-1 cursor-pointer accent-fg"
      />
      <span className="w-10 text-xs tabular-nums text-fg-muted">
        {formatTimestamp(durationMs)}
      </span>
    </div>
  );
}
