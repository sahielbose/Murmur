import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Web app", href: "/app" },
      { label: "Desktop — soon", href: "#" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact sales", href: "/enterprise" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

/** Marketing footer — software only, no shipping / track-order (MURMUR_UI.md §7). */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-container gap-10 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-fg-muted">
            Be present. Murmur remembers.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-[13px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
              {col.title}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-muted transition-colors duration-1 hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-fg-subtle sm:flex-row">
          <span>© {year} Murmur</span>
          <span>Made for people who talk for a living.</span>
        </div>
      </div>
    </footer>
  );
}
