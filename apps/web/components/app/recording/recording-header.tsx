"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate, formatDuration } from "@/lib/format";
import { TagPill, type TagLike } from "@/components/app/tag-pill";
import { StatusPill } from "@/components/app/status-pill";

export type HeaderRecording = {
  id: string;
  title: string;
  status: string;
  durationSec: number | null;
  recordedAt: string | null;
};

/** Recording detail header: editable title, date, duration, and tags. */
export function RecordingHeader({
  recording,
  tags,
}: {
  recording: HeaderRecording;
  tags: TagLike[];
}) {
  const [title, setTitle] = useState(recording.title);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(recording.title);
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    const next = draft.trim() || "Untitled recording";
    setEditing(false);
    if (next === title) return;
    setTitle(next);
    setSaving(true);
    try {
      await fetch(`/api/recordings/${recording.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: next }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commit();
              if (e.key === "Escape") {
                setDraft(title);
                setEditing(false);
              }
            }}
            className="w-full max-w-2xl rounded-md border border-border bg-bg px-2 py-1 text-2xl font-semibold tracking-tight text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Recording title"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(title);
              setEditing(true);
            }}
            className="group flex items-center gap-2 text-left"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">
              {title}
            </h1>
            <Pencil className="h-4 w-4 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
        {saving ? (
          <Check className="mt-2 h-4 w-4 animate-pulse text-fg-subtle" />
        ) : null}
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted",
        )}
      >
        {recording.status !== "done" ? (
          <StatusPill status={recording.status} />
        ) : null}
        {recording.recordedAt ? (
          <span>{formatDate(recording.recordedAt)}</span>
        ) : null}
        <span aria-hidden>·</span>
        <span>{formatDuration(recording.durationSec)}</span>
        {tags.length > 0 ? (
          <>
            <span aria-hidden>·</span>
            <span className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <TagPill key={t.id} tag={t} />
              ))}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
