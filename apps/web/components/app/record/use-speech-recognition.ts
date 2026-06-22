"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecorderState } from "./use-audio-recorder";

export type SpeechSegment = { text: string; startMs: number; endMs: number };

type SpeechResult = { 0: { transcript: string }; isFinal: boolean };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Real live transcription via the browser's Web Speech API — the "voice
 * detection" on the Record screen, with no extra API key. Captures finalized
 * segments (with timestamps) so the saved recording uses the real words.
 */
export function useSpeechRecognition(state: RecorderState) {
  const [supported, setSupported] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const segmentsRef = useRef<SpeechSegment[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    setSupported(Boolean(getCtor()));
  }, []);

  // Reset for a fresh recording.
  useEffect(() => {
    if (state === "requesting") {
      setLines([]);
      setInterim("");
      segmentsRef.current = [];
      startedAtRef.current = null;
    }
  }, [state]);

  useEffect(() => {
    const Ctor = getCtor();
    if (!Ctor) return;

    if (state === "recording") {
      if (startedAtRef.current == null) startedAtRef.current = Date.now();
      if (recRef.current) return; // already listening
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        let interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]!;
          const text = String(r[0].transcript).trim();
          if (r.isFinal) {
            if (text) {
              const base = startedAtRef.current ?? Date.now();
              const prevEnd = segmentsRef.current.at(-1)?.endMs ?? 0;
              const endMs = Math.max(prevEnd + 1000, Date.now() - base);
              segmentsRef.current.push({ text, startMs: prevEnd, endMs });
              setLines((prev) => [...prev, text]);
            }
          } else {
            interimText += r[0].transcript;
          }
        }
        setInterim(interimText.trim());
      };
      // Chrome ends the session on silence — restart while still recording.
      rec.onend = () => {
        if (activeRef.current) {
          try {
            rec.start();
          } catch {
            /* already started */
          }
        }
      };
      rec.onerror = () => {};
      activeRef.current = true;
      try {
        rec.start();
      } catch {
        /* ignore double-start */
      }
      recRef.current = rec;
    } else {
      activeRef.current = false;
      if (recRef.current) {
        try {
          recRef.current.stop();
        } catch {
          /* ignore */
        }
        recRef.current = null;
      }
      if (state !== "paused") setInterim("");
    }
  }, [state]);

  const getSegments = useCallback(() => segmentsRef.current.slice(), []);

  return { supported, lines, interim, getSegments };
}
