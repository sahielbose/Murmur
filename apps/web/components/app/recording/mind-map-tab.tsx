"use client";

import { useState } from "react";
import { Download, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { MindMapGraph } from "@murmur/db";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { layoutMindMap } from "@/lib/mindmap-layout";
import { downloadText, slugify } from "@/lib/export-text";
import {
  downloadBlob,
  mindMapToSvgString,
  readMindMapTheme,
  svgStringToPngBlob,
} from "@/lib/mindmap-export";
import { MindMapCanvas } from "./mind-map-canvas";

export function MindMapTab({
  recordingId,
  title,
  graph,
}: {
  recordingId: string;
  title: string;
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

  const doExport = async (kind: "png" | "svg" | "json") => {
    if (!current) return;
    const slug = `${slugify(title)}-mind-map`;
    if (kind === "json") {
      downloadText(
        `${slug}.json`,
        JSON.stringify(current, null, 2),
        "application/json",
      );
      return;
    }
    const layout = layoutMindMap(current);
    const svg = mindMapToSvgString(layout, readMindMapTheme());
    if (kind === "svg") {
      downloadText(`${slug}.svg`, svg, "image/svg+xml");
      return;
    }
    try {
      const blob = await svgStringToPngBlob(svg, layout.width, layout.height);
      downloadBlob(`${slug}.png`, blob);
    } catch {
      toast.error("Could not export PNG.");
    }
  };

  if (!current || current.nodes.length === 0) {
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
            {busy ? "Generating…" : "Generate mind map"}
          </Button>
        </div>
        <p className="py-6 text-sm text-fg-muted">
          No mind map yet. Choose Generate to build one from the transcript.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex justify-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => void doExport("png")}>
              PNG image
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void doExport("svg")}>
              SVG vector
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void doExport("json")}>
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
