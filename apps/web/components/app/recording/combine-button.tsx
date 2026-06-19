"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitMerge } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CombineOption = { id: string; title: string };

export function CombineButton({
  recordingId,
  recordingTitle,
  others,
}: {
  recordingId: string;
  recordingTitle: string;
  others: CombineOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  if (others.length === 0) return null;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const combine = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/recordings/combine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordingIds: [recordingId, ...selected],
        }),
      });
      const data = (await res.json()) as { id?: string };
      if (data.id) router.push(`/app/combined/${data.id}`);
      else toast.error("Could not combine.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <GitMerge className="h-4 w-4" />
        Combine
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Combine recordings</DialogTitle>
            <DialogDescription>
              Merge “{recordingTitle}” with others into one view. Each keeps a
              link back to its source.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {others.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-bg-subtle"
              >
                <input
                  type="checkbox"
                  checked={selected.has(o.id)}
                  onChange={() => toggle(o.id)}
                  className="h-4 w-4 accent-fg"
                />
                <span className="truncate text-sm text-fg">{o.title}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={combine} disabled={busy || selected.size === 0}>
              {busy ? "Combining…" : "Combine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
