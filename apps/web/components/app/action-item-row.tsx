"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { DraftFollowupButton } from "@/components/app/draft-followup-button";

export type ActionItemData = {
  id: string;
  text: string;
  status: "open" | "done";
  owner: string | null;
  dueAt: string | null;
  recording?: { id: string; title: string };
};

/** A single checkable action item (MURMUR_UI.md §10.7). */
export function ActionItemRow({
  item,
  onToggle,
  recordingTitle,
}: {
  item: ActionItemData;
  onToggle: (id: string, done: boolean) => void;
  recordingTitle?: string;
}) {
  const done = item.status === "done";
  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        onClick={() => onToggle(item.id, !done)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border-strong hover:border-fg",
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "leading-snug text-fg",
            done && "text-fg-muted line-through",
          )}
        >
          {item.text}
        </p>
        {item.owner || item.dueAt ? (
          <p className="mt-0.5 text-xs text-fg-subtle">
            {item.owner ? <span>{item.owner}</span> : null}
            {item.owner && item.dueAt ? <span> · </span> : null}
            {item.dueAt ? <span>Due {formatDate(item.dueAt)}</span> : null}
          </p>
        ) : null}
        {item.recording ? (
          <Link
            href={`/app/recordings/${item.recording.id}`}
            className="mt-0.5 inline-block text-xs text-fg-subtle underline-offset-2 hover:text-fg hover:underline"
          >
            {item.recording.title}
          </Link>
        ) : null}
      </div>
      {!done ? (
        <DraftFollowupButton
          commitment={item.text}
          recordingTitle={recordingTitle ?? item.recording?.title}
          label="Draft"
          className="shrink-0"
        />
      ) : null}
    </li>
  );
}
