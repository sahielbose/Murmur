"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles, X } from "lucide-react";
import type { DigestView } from "@/lib/resurfacing";
import { Button } from "@/components/ui/button";

export function HighlightsCard({ digest }: { digest: DigestView | null }) {
  const router = useRouter();
  const [data, setData] = useState<DigestView | null>(digest);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try {
      await fetch("/api/highlights/refresh", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const dismiss = async () => {
    if (!data) return;
    const id = data.id;
    setData(null);
    await fetch(`/api/highlights/${id}/dismiss`, { method: "POST" }).catch(
      () => {},
    );
    router.refresh();
  };

  return (
    <section className="rounded-xl border border-border bg-bg p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-subtle text-fg-muted">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="font-semibold text-fg-strong">Worth revisiting</h2>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            disabled={busy}
            aria-label="Refresh highlights"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {data ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void dismiss()}
              aria-label="Dismiss highlights"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {data && data.items.length > 0 ? (
        <ul className="space-y-2">
          {data.items.map((item, i) => (
            <li key={i}>
              <Link
                href={
                  item.recordingId
                    ? `/app/recordings/${item.recordingId}`
                    : "/app/library"
                }
                className="block rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-bg-subtle"
              >
                <p className="text-sm text-fg">{item.text}</p>
                <p className="mt-0.5 text-xs text-fg-subtle">
                  from {item.recordingTitle}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-muted">
          You&apos;re all caught up — nothing to revisit right now.
        </p>
      )}
    </section>
  );
}
