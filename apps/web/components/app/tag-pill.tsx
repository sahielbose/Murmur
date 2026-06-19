import { cn } from "@/lib/utils";

export type TagLike = { id: string; name: string; color: string };

/** A colored tag pill (MURMUR_UI.md §6). The dot carries the tag color; the
 * label stays monochrome to keep the editorial palette. */
export function TagPill({
  tag,
  className,
  onRemove,
}: {
  tag: TagLike;
  className?: string;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-fg",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tag.name}`}
          className="ml-0.5 text-fg-subtle hover:text-fg"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
