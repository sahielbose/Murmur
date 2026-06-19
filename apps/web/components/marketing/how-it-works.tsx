const STEPS = [
  {
    title: "Record or upload.",
    body: "Hit record in the browser, or drop in an audio file.",
  },
  {
    title: "Murmur does the work.",
    body: "Transcribes, labels who said what, summarizes, and pulls out your to-dos.",
  },
  {
    title: "Ask and act.",
    body: "Search everything, ask questions, and send the follow-ups when you're ready.",
  },
];

/** "From spoken to sorted, automatically." (MURMUR_UI.md §7, §13). */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-bg py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="max-w-xl font-serif text-3xl leading-tight tracking-tight text-fg-strong sm:text-4xl">
          From spoken to sorted, automatically.
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-fg pt-5">
              <span className="font-serif text-2xl tabular-nums text-fg-strong">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-fg-strong">
                {step.title}
              </h3>
              <p className="mt-2 text-fg-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
