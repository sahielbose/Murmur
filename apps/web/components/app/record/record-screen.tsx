"use client";

import { useAudioRecorder } from "./use-audio-recorder";
import { RecordOrb } from "./record-orb";

/**
 * The live capture canvas (MURMUR_UI.md §10.2). Built up across Phase 8 — for
 * now the orb + status; waveform, timer, controls, consent, and the live
 * transcript follow.
 */
export function RecordScreen() {
  const rec = useAudioRecorder();
  const isRecording = rec.state === "recording" || rec.state === "paused";

  const onToggle = () => {
    if (isRecording) void rec.stop();
    else void rec.start();
  };

  const orbState =
    rec.state === "paused" ? "paused" : isRecording ? "recording" : "idle";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-16">
      <RecordOrb
        state={orbState}
        onClick={onToggle}
        disabled={rec.state === "requesting" || rec.state === "stopping"}
      />
      <p className="text-sm text-fg-muted" aria-live="polite">
        {rec.state === "idle" && "Tap to start recording"}
        {rec.state === "requesting" && "Allow microphone access to start."}
        {rec.state === "recording" && "Listening…"}
        {rec.state === "paused" && "Paused"}
        {rec.state === "stopping" && "Finishing up…"}
        {rec.state === "error" && "We couldn't access your microphone."}
      </p>
    </div>
  );
}
