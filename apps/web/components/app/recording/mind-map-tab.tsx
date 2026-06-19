"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { MindMapGraph } from "@murmur/db";
import { Button } from "@/components/ui/button";
import { MindMapCanvas } from "./mind-map-canvas";

export function MindMapTab({
  recordingId,
  graph,
}: {
  recordingId: string;
  graph: MindMapGraph | null;
}) {
  const [current, setCurrent] = useState(graph);
  const [busy, setBusy] = useState(false);

  const regenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/recordings/${recordingId}/mindmap`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { graph: MindMapGraph };
      setCurrent(data.graph);
      toast.success("Mind map regenerated.");
    } catch {
      toast.error("Could not regenerate the mind map.");
    } finally {
      setBusy(false);
    }
  };

  if (!current || current.nodes.length === 0) {
    return (
      <p className="py-6 text-sm text-fg-muted">
        The mind map appears once processing finishes.
      </p>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={regenerate}
          disabled={busy}
        >
          <Wand2 className="h-4 w-4" />
          {busy ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
      <MindMapCanvas graph={current} />
    </div>
  );
}
