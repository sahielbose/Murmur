import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Murmur mark — four ascending soundwave bars (geometric, flat, single ink).
 * Reads at 24px (MURMUR_UI.md §2).
 */
export function MurmurGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="9" width="3" height="6" rx="1.5" fill="currentColor" />
      <rect x="7" y="6" width="3" height="12" rx="1.5" fill="currentColor" />
      <rect x="12" y="3" width="3" height="18" rx="1.5" fill="currentColor" />
      <rect x="17" y="7" width="3" height="10" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/** The Murmur wordmark: soundwave glyph + the name set in Fraunces. */
export function Wordmark({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Murmur home"
      className={cn(
        "inline-flex items-center gap-2 text-fg-strong transition-opacity hover:opacity-80",
        className,
      )}
    >
      <MurmurGlyph className="h-5 w-5" />
      {showText && (
        <span className="font-serif text-xl font-semibold tracking-tight">
          Murmur
        </span>
      )}
    </Link>
  );
}
