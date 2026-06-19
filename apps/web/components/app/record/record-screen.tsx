"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, Play, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadAudio } from "@/lib/upload-audio";
import { useAudioRecorder, type RecorderError } from "./use-audio-recorder";
import { RecordOrb } from "./record-orb";
import { LiveWaveform } from "./live-waveform";
import { RecordTimer } from "./record-timer";
import { ConsentBanner } from "./consent-banner";
import { LiveTranscript } from "./live-transcript";

const ERROR_COPY: Record<RecorderError, string> = {
  "permission-denied":
    "Microphone access is blocked. Enable it in your browser's site settings, then try again.",
  "no-device": "We couldn't find a microphone. Check your input device.",
  unsupported:
    "This browser doesn't support recording. You can upload an audio file instead.",
  unknown: "Something went wrong starting the recording.",
};

function defaultTitle(): string {
  const now = new Date();
  return `Recording · ${now.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

/**
 * The live capture canvas (MURMUR_UI.md §10.2). Orb + waveform + timer +
 * controls + live transcript, gated by consent. On stop the audio is uploaded
 * and the pipeline is enqueued; mic-permission errors fall back to Upload.
 */
export function RecordScreen({ consented = false }: { consented?: boolean }) {
  const router = useRouter();
  const rec = useAudioRecorder();
  const [acknowledged, setAcknowledged] = useState(consented);
  const [consentOpen, setConsentOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isRecording = rec.state === "recording" || rec.state === "paused";

  const save = async () => {
    const blob = await rec.stop();
    if (!blob) return;
    setSaving(true);
    try {
      const result = await uploadAudio(blob, {
        filename: `recording-${Date.now()}.webm`,
        title: defaultTitle(),
        source: "mic",
        contentType: blob.type,
      });
      toast.success("Saved - Murmur is processing your recording.");
      if (result.id) router.push(`/app/recordings/${result.id}`);
    } catch {
      toast.error("Could not save the recording.");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = () => {
    if (isRecording) {
      void save();
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

      {!isRecording && rec.state !== "error" && selectableDevices.length > 0 ? (
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
        disabled={
          rec.state === "requesting" || rec.state === "stopping" || saving
        }
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

      {rec.state === "error" && rec.error ? (
        <div className="max-w-md rounded-lg border border-border bg-bg-elevated p-4 text-center">
          <p className="text-sm text-fg">{ERROR_COPY[rec.error]}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={rec.reset}>
              Try again
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/app/upload">
                <Upload className="h-4 w-4" />
                Upload instead
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-fg-muted" aria-live="polite">
          {saving
            ? "Saving…"
            : rec.state === "idle"
              ? "Tap to start recording"
              : rec.state === "requesting"
                ? "Allow microphone access to start."
                : rec.state === "recording"
                  ? "Listening - tap the orb to stop."
                  : rec.state === "paused"
                    ? "Paused"
                    : rec.state === "stopping"
                      ? "Finishing up…"
                      : ""}
        </p>
      )}
    </div>
  );
}
