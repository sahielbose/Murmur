"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SpeakerItem = { name: string; recordingCount: number };

export function SpeakersManager({ speakers }: { speakers: SpeakerItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const rename = async (from: string) => {
    const to = window.prompt(
      `Rename "${from}" everywhere. Use an existing name to merge.`,
      from,
    );
    if (!to?.trim() || to.trim() === from) return;
    setBusy(true);
    try {
      await fetch("/api/speakers/rename", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from, to: to.trim() }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (speakers.length === 0) {
    return <p className="text-sm text-fg-muted">No speakers yet.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {speakers.map((s) => (
          <li key={s.name} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-subtle text-fg-muted">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-fg">{s.name}</p>
              <p className="text-xs text-fg-subtle">
                {s.recordingCount}{" "}
                {s.recordingCount === 1 ? "recording" : "recordings"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              disabled={busy}
              onClick={() => void rename(s.name)}
            >
              <Pencil className="h-4 w-4" />
              Rename / merge
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-fg-subtle">
        Voice prints — automatically recognizing recurring speakers across
        recordings — arrive with the real speech provider.
      </p>
    </div>
  );
}
