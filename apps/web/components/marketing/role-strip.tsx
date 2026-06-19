const ROLES = [
  "Founders",
  "Doctors",
  "Lawyers",
  "Students",
  "Therapists",
  "Sales",
];

/**
 * Honest social proof (MURMUR_UI.md §7, §13). No fake corporate logos — a role
 * strip instead.
 */
export function RoleStrip() {
  return (
    <section className="border-b border-border bg-bg py-16">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-serif text-2xl tracking-tight text-fg-strong sm:text-3xl">
          Made for people who talk for a living.
        </h2>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          {ROLES.map((role) => (
            <li
              key={role}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-fg-muted"
            >
              {role}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
