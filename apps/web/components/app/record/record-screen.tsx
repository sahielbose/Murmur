"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAudioRecorder } from "./use-audio-recorder";
import { RecordOrb } from "./record-orb";
import { LiveWaveform } from "./live-waveform";
import { RecordTimer } from "./record-timer";
import { ConsentBanner } from "./consent-banner";
import { LiveTranscript } from "./live-transcript";

/**
 * The live capture canvas (MURMUR_UI.md §10.2). Orb + waveform + timer +
 * controls, gated by the one-time consent notice. The live transcript is added
 * in the next commit.
 */
export function RecordScreen({ consented = false }: { consented?: boolean }) {
  const rec = useAudioRecorder();
  const [acknowledged, setAcknowledged] = useState(consented);
  const [consentOpen, setConsentOpen] = useState(false);
  const isRecording = rec.state === "recording" || rec.state === "paused";

  const onToggle = () => {
    if (isRecording) {
      void rec.stop();
      return;
    }
    if (!acknowledged) {
      setConsentOpen(true);
      return;
    }
    void rec.start();
  };

  const onConsentConfirm = (othersInformed: boolean) => {
    setConsentOpen(false);
    setAcknowledged(true);
    void fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ othersInformed }),
    }).catch(() => {});
    void rec.start();
  };

  const orbState =
    rec.state === "paused" ? "paused" : isRecording ? "recording" : "idle";

  const selectableDevices = rec.devices.filter((d) => d.deviceId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
      <ConsentBanner
        open={consentOpen}
        onConfirm={onConsentConfirm}
        onCancel={() => setConsentOpen(false)}
      />

      {!isRecording && selectableDevices.length > 0 ? (
        <Select
          value={rec.deviceId ?? undefined}
          onValueChange={rec.setDeviceId}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Default microphone" />
          </SelectTrigger>
          <SelectContent>
            {selectableDevices.map((d) => (
              <SelectItem key={d.deviceId} value={d.deviceId}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {isRecording ? (
        <div className="flex items-center gap-2">
          {rec.state === "recording" ? (
            <span
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-rec"
              aria-hidden
            />
          ) : null}
          <RecordTimer state={rec.state} />
        </div>
      ) : null}

      <RecordOrb
        state={orbState}
        onClick={onToggle}
        disabled={rec.state === "requesting" || rec.state === "stopping"}
      />

      <LiveWaveform stream={rec.stream} active={rec.state === "recording"} />

      <LiveTranscript state={rec.state} />

      {isRecording ? (
        <div className="flex items-center gap-3">
          {rec.state === "recording" ? (
            <Button variant="secondary" size="sm" onClick={rec.pause}>
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={rec.resume}>
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
        </div>
      ) : null}

      <p className="text-sm text-fg-muted" aria-live="polite">
        {rec.state === "idle" && "Tap to start recording"}
        {rec.state === "requesting" && "Allow microphone access to start."}
        {rec.state === "recording" && "Listening — tap the orb to stop."}
        {rec.state === "paused" && "Paused"}
        {rec.state === "stopping" && "Finishing up…"}
        {rec.state === "error" && "We couldn't access your microphone."}
      </p>
    </div>
  );
}
