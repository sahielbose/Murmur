"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";

export type SummaryData = {
  id: string;
  contentMd: string;
  style: string;
};

export function SummaryTab({
  recordingId,
  summary,
}: {
  recordingId: string;
  summary: SummaryData | null;
}) {
  const [content, setContent] = useState(summary?.contentMd ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);

  if (!summary) {
    return (
      <p className="py-6 text-sm text-fg-muted">
        No summary yet — it appears once processing finishes.
      </p>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/recordings/${recordingId}/summary`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summaryId: summary.id, contentMd: draft }),
      });
      if (!res.ok) throw new Error();
      setContent(draft);
      setEditing(false);
      toast.success("Summary saved.");
    } catch {
      toast.error("Could not save the summary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
          {summary.style}
        </span>
        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(content);
              setEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            className="w-full rounded-md border border-border bg-bg p-3 font-mono text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Edit summary markdown"
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Markdown>{content}</Markdown>
      )}
    </div>
  );
}
