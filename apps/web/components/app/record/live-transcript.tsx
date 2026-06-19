"use client";

import { useEffect, useRef, useState } from "react";
import type { RecorderState } from "./use-audio-recorder";

// Original canned phrases for the mock live view. The authoritative transcript
// is produced by the batch pass after the recording stops.
const PHRASES = [
  "Thanks for hopping on - let's start with where things stand.",
  "We're mostly on track. The one risk is the timeline for next week.",
  "What would help de-risk it?",
  "A quick review tomorrow, then I'll send the summary.",
  "Sounds good. I'll get you the notes this afternoon.",
];

/**
 * Live transcript view (MURMUR_UI.md §10.2). Streams mock partials while
 * recording - interim text is muted, finalized lines use `--fg`. Resets on a
 * fresh recording, freezes on pause.
 */
export function LiveTranscript({ state }: { state: RecorderState }) {
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
    </div>
  );
}
