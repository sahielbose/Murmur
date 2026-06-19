"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SearchResult } from "@/lib/search";

const KIND_LABEL: Record<string, string> = {
  title: "Title",
  transcript: "Transcript",
  summary: "Summary",
  semantic: "Related",
};

/** Global ⌘K search palette (MURMUR_UI.md §9). Opens on ⌘K or the topbar field. */
export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("murmur:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("murmur:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ q }),
        });
        const data = (await res.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const go = (r: SearchResult) => {
    setOpen(false);
    const ts = r.startMs != null ? `?t=${Math.floor(r.startMs / 1000)}` : "";
    router.push(`/app/recordings/${r.recordingId}${ts}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[18%] translate-y-0 gap-0 p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search your conversations</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 shrink-0 text-fg-subtle" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your conversations"
            aria-label="Search your conversations"
            className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {q && !loading && results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-fg-muted">
              No matches found.
            </p>
          ) : null}
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(r)}
              className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-bg-subtle"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-fg">
                  {r.recordingTitle}
                </span>
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-fg-subtle">
                  {KIND_LABEL[r.kind] ?? r.kind}
                </span>
              </span>
              <span className="line-clamp-1 text-xs text-fg-muted">
                {r.snippet}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
