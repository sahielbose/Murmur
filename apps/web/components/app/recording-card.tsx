import Link from "next/link";
import { formatDate, formatDuration } from "@/lib/format";
import { TagPill } from "@/components/app/tag-pill";
import { StatusPill } from "@/components/app/status-pill";
import type { LibraryCard } from "@/lib/recordings";

/** A recording card for the library grid (MURMUR_UI.md §10.4). */
export function RecordingCard({ recording }: { recording: LibraryCard }) {
  return (
    <Link
      href={`/app/recordings/${recording.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:border-border-strong hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-medium text-fg">{recording.title}</h3>
        {recording.status !== "done" ? (
          <StatusPill status={recording.status} />
        ) : null}
      </div>
      <p className="text-xs text-fg-subtle">
        {recording.recordedAt ? formatDate(recording.recordedAt) : "-"}
        {" · "}
        {formatDuration(recording.durationSec)}
      </p>
      {recording.snippet ? (
        <p className="line-clamp-2 text-sm text-fg-muted">
          {recording.snippet}
        </p>
      ) : null}
      {recording.tags.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {recording.tags.map((t) => (
            <TagPill key={t.id} tag={t} />
          ))}
        </div>
      ) : null}
    </Link>
  );
}
