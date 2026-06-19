"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordingCard } from "@/components/app/recording-card";
import type { LibraryCard } from "@/lib/recordings";

const PROCESSING = new Set([
  "recording",
  "uploaded",
  "transcribing",
  "summarizing",
]);

export function LibraryView({ recordings }: { recordings: LibraryCard[] }) {
  const [tag, setTag] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const tagOptions = useMemo(() => {
    const set = new Map<string, string>();
    for (const r of recordings) for (const t of r.tags) set.set(t.name, t.name);
    return Array.from(set.keys()).sort();
  }, [recordings]);

  const filtered = useMemo(() => {
    const out = recordings.filter((r) => {
      if (tag !== "all" && !r.tags.some((t) => t.name === tag)) return false;
      if (status === "done" && r.status !== "done") return false;
      if (status === "processing" && !PROCESSING.has(r.status)) return false;
      if (status === "failed" && r.status !== "failed") return false;
      return true;
    });
    const time = (r: LibraryCard) =>
      r.recordedAt ? new Date(r.recordedAt).getTime() : 0;
    out.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return time(a) - time(b);
        case "longest":
          return (b.durationSec ?? 0) - (a.durationSec ?? 0);
        case "shortest":
          return (a.durationSec ?? 0) - (b.durationSec ?? 0);
        default:
          return time(b) - time(a);
      }
    });
    return out;
  }, [recordings, tag, status, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tagOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="done">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="longest">Longest</SelectItem>
            <SelectItem value="shortest">Shortest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-fg-muted">
          No recordings match these filters.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecordingCard key={r.id} recording={r} />
          ))}
        </div>
      )}
    </div>
  );
}
