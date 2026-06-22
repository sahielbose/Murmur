"use client";

import { useEffect, useRef, useState } from "react";
import type { RecorderState } from "./use-audio-recorder";

/** Presentational live transcript: finalized lines + a muted interim line. */
export function LiveTranscript({
  lines,
  interim,
}: {
  lines: string[];
  interim: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines.length, interim]);

  if (lines.length === 0 && !interim) return null;

  return (
    <div className="max-h-48 w-full max-w-md space-y-1.5 overflow-y-auto rounded-lg border border-border bg-bg-elevated p-4 text-left">
      {lines.map((line, i) => (
        <p key={i} className="text-sm leading-relaxed text-fg">
          {line}
        </p>
      ))}
      {interim ? (
        <p className="text-sm leading-relaxed text-fg-subtle">{interim}</p>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}

// Original canned phrases, shown only when the browser has no speech
// recognition (e.g. Firefox). The authoritative transcript still comes from the
// batch pass after the recording stops.
const PHRASES = [
  "Thanks for hopping on - let's start with where things stand.",
  "We're mostly on track. The one risk is the timeline for next week.",
  "What would help de-risk it?",
  "A quick review tomorrow, then I'll send the summary.",
  "Sounds good. I'll get you the notes this afternoon.",
];

/** Fallback simulated transcript for browsers without Web Speech. */
export function MockLiveTranscript({ state }: { state: RecorderState }) {
  const [lines, setLines] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const phraseIdx = useRef(0);
  const wordIdx = useRef(0);

  useEffect(() => {
    if (state === "requesting") {
      setLines([]);
      setInterim("");
      phraseIdx.current = 0;
      wordIdx.current = 0;
    }
  }, [state]);

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => {
      const phrase = PHRASES[phraseIdx.current % PHRASES.length]!;
      const words = phrase.split(" ");
      wordIdx.current += 1;
      if (wordIdx.current >= words.length) {
        setLines((prev) => [...prev, phrase]);
        setInterim("");
        phraseIdx.current += 1;
        wordIdx.current = 0;
      } else {
        setInterim(words.slice(0, wordIdx.current).join(" "));
      }
    }, 280);
    return () => clearInterval(id);
  }, [state]);

  return <LiveTranscript lines={lines} interim={interim} />;
}
