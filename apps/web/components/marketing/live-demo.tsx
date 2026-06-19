"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

const SCRIPT = [
  { speaker: "You", text: "Can we ship the beta by Friday?" },
  { speaker: "Sam", text: "Yes — I'll send the build to the team tonight." },
];
const ACTION = "Send the beta build to the team";
const BARS = 48;

/**
 * Hero centerpiece (MURMUR_UI.md §7, §12): a coded loop — waveform animates,
 * transcript lines auto-type, then an "Action item" chip slides up. No device,
 * no video. Pauses offscreen and honours prefers-reduced-motion.
 */
export function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState<string[]>(SCRIPT.map(() => ""));
  const [activeLine, setActiveLine] = useState(0);
  const [showChip, setShowChip] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setTyped(SCRIPT.map((s) => s.text));
      setActiveLine(SCRIPT.length);
      setShowChip(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry?.isIntersecting ?? false),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    let line = 0;
    let char = 0;
    let chip = false;
    let timer: number;

    setTyped(SCRIPT.map(() => ""));
    setActiveLine(0);
    setShowChip(false);

    const tick = () => {
      if (line < SCRIPT.length) {
        const full = SCRIPT[line]!.text;
        if (char <= full.length) {
          const captured = line;
          const slice = full.slice(0, char);
          setTyped((prev) => {
            const next = [...prev];
            next[captured] = slice;
            return next;
          });
          char += 1;
          timer = window.setTimeout(tick, 36);
        } else {
          line += 1;
          char = 0;
          setActiveLine(line);
          timer = window.setTimeout(tick, 440);
        }
      } else if (!chip) {
        chip = true;
        setShowChip(true);
        timer = window.setTimeout(tick, 2800);
      } else {
        line = 0;
        char = 0;
        chip = false;
        setTyped(SCRIPT.map(() => ""));
        setActiveLine(0);
        setShowChip(false);
        timer = window.setTimeout(tick, 500);
      }
    };

    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [running]);

  return (
    <div
      ref={ref}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8"
      aria-hidden
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        Listening
      </div>

      <div className="mt-5 flex h-12 items-end gap-[3px]">
        {Array.from({ length: BARS }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] flex-1 rounded-full bg-white/25"
            style={{
              height: "100%",
              transformOrigin: "bottom",
              animation: running
                ? `mwave 1.1s ease-in-out ${(i % 12) * 0.07}s infinite`
                : "none",
            }}
          />
        ))}
      </div>

      <div className="mt-6 min-h-[72px] space-y-2">
        {SCRIPT.map((s, i) =>
          i <= activeLine ? (
            <p key={i} className="text-sm leading-relaxed text-white/80">
              <span className="mr-2 text-white/40">{s.speaker}</span>
              {typed[i]}
              {running && i === activeLine && i < SCRIPT.length ? (
                <span className="mcaret" />
              ) : null}
            </p>
          ) : null,
        )}
      </div>

      <div
        className={`mt-2 transition-all duration-500 ${
          showChip ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">
          <Check className="h-3.5 w-3.5" />
          Action item · {ACTION}
        </span>
      </div>

      <style>{`
        @keyframes mwave { 0%, 100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }
        .mcaret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: text-bottom; background: #fff; animation: mblink 1s steps(1) infinite; }
        @keyframes mblink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
