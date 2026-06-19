const QUOTES = [
  {
    quote:
      "I walk out of every consult with the notes already written. I get to actually look at my patient.",
    role: "Family physician",
  },
  {
    quote:
      "Discovery calls used to eat my evenings. Now the summary and the follow-up are waiting for me.",
    role: "Account executive",
  },
  {
    quote:
      "I record every lecture and ask it questions the night before the exam.",
    role: "Graduate student",
  },
  {
    quote:
      "Intake, prep, the lot - every conversation searchable down to the exact sentence.",
    role: "Litigation associate",
  },
];

/**
 * "Built for people who can't miss a word." (MURMUR_UI.md §7, §13). Generic
 * role attributions only - no invented names or logos.
 */
export function Testimonials() {
  return (
    <section className="bg-bg-subtle py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center font-serif text-3xl leading-tight tracking-tight text-fg-strong sm:text-4xl">
          Built for people who can&apos;t miss a word.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {QUOTES.map(({ quote, role }) => (
            <figure
              key={role}
              className="rounded-2xl border border-border bg-bg p-6"
            >
              <blockquote className="font-serif text-xl leading-snug tracking-tight text-fg-strong">
                “{quote}”
              </blockquote>
              <figcaption className="mt-4 text-[13px] font-medium uppercase tracking-[0.12em] text-fg-muted">
                {role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
