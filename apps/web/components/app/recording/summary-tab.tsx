"use client";

import { useState } from "react";
import { Download, Pencil, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadText, mdToPlainText, slugify } from "@/lib/export-text";

export type SummaryData = {
  id: string;
  contentMd: string;
  style: string;
  templateId: string | null;
};

export type TemplateOption = { id: string; name: string };

export function SummaryTab({
  recordingId,
  title,
  summary,
  templates,
}: {
  recordingId: string;
  title: string;
  summary: SummaryData | null;
  templates: TemplateOption[];
}) {
  const [content, setContent] = useState(summary?.contentMd ?? "");
  const [style, setStyle] = useState(summary?.style ?? "");
  const [templateId, setTemplateId] = useState(summary?.templateId ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/recordings/${recordingId}/summary`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId: templateId || undefined }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { contentMd: string; style: string };
      setContent(data.contentMd);
      setStyle(data.style);
      setEditing(false);
      toast.success("Summary regenerated.");
    } catch {
      toast.error("Could not regenerate the summary.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select value={templateId || undefined} onValueChange={setTemplateId}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder={style || "Choose a style"} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            size="sm"
            onClick={regenerate}
            disabled={regenerating}
          >
            <Wand2 className="h-4 w-4" />
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
        {!editing ? (
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() =>
                    downloadText(
                      `${slugify(title)}.md`,
                      content,
                      "text/markdown",
                    )
                  }
                >
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    downloadText(
                      `${slugify(title)}.txt`,
                      mdToPlainText(content),
                      "text/plain",
                    )
                  }
                >
                  Plain text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    window.location.href = `/api/recordings/${recordingId}/export?format=pdf`;
                  }}
                >
                  PDF (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    window.location.href = `/api/recordings/${recordingId}/export?format=docx`;
                  }}
                >
                  Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    window.location.href = `/api/recordings/${recordingId}/audio?download=1`;
                  }}
                >
                  Audio file
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </div>
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
