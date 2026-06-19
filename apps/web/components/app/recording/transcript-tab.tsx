"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
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

function EditableSpeaker({
  name,
  onRename,
}: {
  name: string;
  onRename: (to: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft.trim() && draft.trim() !== name) onRename(draft.trim());
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(name);
            setEditing(false);
          }
        }}
        className="w-32 rounded border border-border bg-bg px-1 text-sm font-medium text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Speaker name"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name);
        setEditing(true);
      }}
      className="group/spk inline-flex items-center gap-1 text-sm font-medium text-fg"
    >
      {name}
      <Pencil className="h-3 w-3 text-fg-subtle opacity-0 transition-opacity group-hover/spk:opacity-100" />
    </button>
  );
}

/**
 * Transcript tab (MURMUR_UI.md §10.5): speaker-labeled turns with click-to-seek
 * timestamps. Renaming a speaker propagates across all of its turns.
 */
export function TranscriptTab({
  recordingId,
  rows: initialRows,
}: {
  recordingId: string;
  rows: TranscriptRow[];
}) {
  const audio = useRecordingAudio();
  const [rows, setRows] = useState(initialRows);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, []);

  const renameSpeaker = (from: string, to: string) => {
    setRows((prev) =>
      prev.map((r) => (r.speaker === from ? { ...r, speaker: to } : r)),
    );
    void fetch(`/api/recordings/${recordingId}/speakers`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from, to }),
    }).catch(() => {});
  };

  if (rows.length === 0) {
    return (
      <p className="py-6 text-sm text-fg-muted">
        The transcript appears once processing finishes.
      </p>
    );
  }

  const turns = toTurns(rows);
  const cur = audio?.currentMs ?? 0;
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
              <EditableSpeaker
                name={turn.speaker}
                onRename={(to) => renameSpeaker(turn.speaker, to)}
              />
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
