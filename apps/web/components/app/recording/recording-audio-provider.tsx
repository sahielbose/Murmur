"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type RecordingAudio = {
  currentMs: number;
  durationMs: number;
  playing: boolean;
  hasAudio: boolean;
  seek: (ms: number) => void;
  toggle: () => void;
};

const Ctx = createContext<RecordingAudio | null>(null);

export function useRecordingAudio() {
  return useContext(Ctx);
}

/**
 * Owns the recording's <audio> element and exposes play/seek state so the
 * AudioPlayerBar and the transcript's click-to-seek stay in sync
 * (MURMUR_UI.md §10.5).
 */
export function RecordingAudioProvider({
  src,
  fallbackDurationSec,
  initialSeekMs,
  children,
}: {
  src: string | null;
  fallbackDurationSec?: number | null;
  initialSeekMs?: number | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [currentMs, setCurrentMs] = useState(initialSeekMs ?? 0);
  const [durationMs, setDurationMs] = useState(
    (fallbackDurationSec ?? 0) * 1000,
  );
  const [playing, setPlaying] = useState(false);

  const seek = useCallback((ms: number) => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = ms / 1000;
    void el.play().catch(() => {});
  }, []);

  // Deep-link: seek the audio to the linked moment once it can play.
  useEffect(() => {
    if (initialSeekMs == null) return;
    const el = ref.current;
    if (!el) return;
    const onReady = () => {
      el.currentTime = initialSeekMs / 1000;
    };
    el.addEventListener("loadedmetadata", onReady, { once: true });
    return () => el.removeEventListener("loadedmetadata", onReady);
  }, [initialSeekMs]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, []);

  return (
    <Ctx.Provider
      value={{
        currentMs,
        durationMs,
        playing,
        hasAudio: Boolean(src),
        seek,
        toggle,
      }}
    >
      {src ? (
        <audio
          ref={ref}
          src={src}
          preload="metadata"
          onTimeUpdate={(e) => setCurrentMs(e.currentTarget.currentTime * 1000)}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDurationMs(d * 1000);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      ) : null}
      {children}
    </Ctx.Provider>
  );
}
