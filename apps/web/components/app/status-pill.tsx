import { cn } from "@/lib/utils";

type Tone = "processing" | "done" | "failed";

const MAP: Record<string, { label: string; tone: Tone }> = {
  recording: { label: "Recording", tone: "processing" },
  uploaded: { label: "Queued", tone: "processing" },
  transcribing: { label: "Transcribing", tone: "processing" },
  summarizing: { label: "Summarizing", tone: "processing" },
  done: { label: "Ready", tone: "done" },
  failed: { label: "Failed", tone: "failed" },
};

/** Recording status pill — pairs the dot with text (not color alone, a11y). */
export function StatusPill({ status }: { status: string }) {
  const info = MAP[status] ?? { label: status, tone: "processing" as Tone };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-fg">
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full",
          info.tone === "processing" && "animate-pulse bg-warning",
          info.tone === "done" && "bg-success",
          info.tone === "failed" && "bg-danger",
        )}
      />
      {info.label}
    </span>
  );
}
