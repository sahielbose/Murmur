import { Coffee, Stethoscope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TILES: { caption: string; Icon: LucideIcon; wide?: boolean }[] = [
  { caption: "In the meeting", Icon: Users, wide: true },
  { caption: "At the doctor", Icon: Stethoscope },
  { caption: "Over coffee", Icon: Coffee },
];

/**
 * "The important conversations happen out loud." (MURMUR_UI.md §7, §13).
 * De-hardware'd ImageCluster - coded monochrome tiles, not photos.
 */
export function InPerson() {
  return (
    <section className="bg-bg-subtle py-24">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="max-w-md font-serif text-3xl leading-tight tracking-tight text-fg-strong sm:text-4xl">
            The important conversations happen out loud.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-muted">
            The pen was the only tool that worked away from a screen. Murmur is
            the upgrade - hit record, stay in the moment, and get every detail
            back as notes.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          data-parallax="cluster"
        >
          {TILES.map(({ caption, Icon, wide }) => (
            <figure
              key={caption}
              className={`group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-bg p-4 ${
                wide ? "aspect-[16/7] sm:col-span-2" : ""
              }`}
            >
              <Icon
                className="absolute right-4 top-4 h-16 w-16 text-border-strong"
                strokeWidth={1}
                aria-hidden
              />
              <figcaption className="text-[13px] font-medium uppercase tracking-[0.12em] text-fg-muted">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
