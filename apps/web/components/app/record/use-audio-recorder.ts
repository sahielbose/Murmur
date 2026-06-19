"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState =
  | "idle"
  | "requesting"
  | "recording"
  | "paused"
  | "stopping"
  | "error";

export type MicDevice = { deviceId: string; label: string };

export type RecorderError =
  | "permission-denied"
  | "no-device"
  | "unsupported"
  | "unknown";

export type UseAudioRecorder = {
  state: RecorderState;
  error: RecorderError | null;
  /** Live MediaStream while recording - drives the waveform analyser. */
  stream: MediaStream | null;
  devices: MicDevice[];
  deviceId: string | null;
  setDeviceId: (id: string) => void;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  /** Stop and resolve the assembled audio blob (null if nothing captured). */
  stop: () => Promise<Blob | null>;
  reset: () => void;
};

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * Browser microphone capture (MURMUR_CONTEXT.md §4.2). Wraps getUserMedia +
 * MediaRecorder with pause/resume, device selection, chunk collection, and
 * friendly permission/error handling. The live MediaStream is exposed for the
 * waveform.
 */
export function useAudioRecorder(): UseAudioRecorder {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MicDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const mics = all
        .filter((d) => d.kind === "audioinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${i + 1}`,
        }));
      setDevices(mics);
      setDeviceId((cur) => cur ?? mics[0]?.deviceId ?? null);
    } catch {
      // enumeration can fail before permission is granted - ignore.
    }
  }, []);

  useEffect(() => {
    void refreshDevices();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [refreshDevices]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("unsupported");
      setState("error");
      return;
    }

    setState("requesting");
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const media = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = media;
      setStream(media);
      void refreshDevices();

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        media,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, {
              type: mimeType ?? "audio/webm",
            })
          : null;
        cleanupStream();
        setState("idle");
        stopResolveRef.current?.(blob);
        stopResolveRef.current = null;
      };
      recorderRef.current = recorder;
      recorder.start(1000); // 1s timeslices
      setState("recording");
    } catch (err) {
      cleanupStream();
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("permission-denied");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("no-device");
      } else {
        setError("unknown");
      }
      setState("error");
    }
  }, [deviceId, refreshDevices, cleanupStream]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      setState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      setState("recording");
    }
  }, []);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      setState("stopping");
      stopResolveRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    cleanupStream();
    recorderRef.current = null;
    chunksRef.current = [];
    setError(null);
    setState("idle");
  }, [cleanupStream]);

  return {
    state,
    error,
    stream,
    devices,
    deviceId,
    setDeviceId,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
