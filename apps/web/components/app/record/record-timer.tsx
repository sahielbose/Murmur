"use client";

import { useEffect, useRef, useState } from "react";
import type { RecorderState } from "./use-audio-recorder";

function format(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Elapsed timer that runs while recording and freezes when paused. */
export function RecordTimer({ state }: { state: RecorderState }) {
  const [ms, setMs] = useState(0);
  const accRef = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === "idle") {
      accRef.current = 0;
      startRef.current = null;
      setMs(0);
      return;
    }
    if (state === "recording") {
      startRef.current = performance.now();
      const id = setInterval(() => {
        const live = startRef.current
          ? performance.now() - startRef.current
          : 0;
        setMs(accRef.current + live);
      }, 200);
      return () => {
        if (startRef.current) {
          accRef.current += performance.now() - startRef.current;
          startRef.current = null;
        }
        clearInterval(id);
      };
    }
  }, [state]);

  return (
    <span className="font-sans text-3xl tabular-nums tracking-tight text-fg">
      {format(ms)}
    </span>
  );
}
