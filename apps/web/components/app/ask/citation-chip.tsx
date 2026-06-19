import Link from "next/link";
import { formatTimestamp } from "@/lib/format";

export type Citation = {
  recordingId: string;
  startMs: number;
  label?: string;
};

/** A citation chip that deep-links to the source recording @ timestamp. */
export function CitationChip({
  citation,
  index,
}: {
  citation: Citation;
  index: number;
}) {
  const seconds = Math.floor(citation.startMs / 1000);
  return (
    <Link
      href={`/app/recordings/${citation.recordingId}?t=${seconds}`}
      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
    >
      <span className="font-medium text-fg">[{index}]</span>
      <span className="truncate">
        {citation.label ?? "source"} · {formatTimestamp(citation.startMs)}
      </span>
    </Link>
  );
}
