"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileAudio,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { validateUpload } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ACCEPT =
  ".mp3,.m4a,.wav,.aac,.ogg,.webm,.mp4,.mov,audio/*,video/mp4,video/quicktime";

type Status = "idle" | "uploading" | "finalizing" | "done" | "error";

function deriveTitle(filename: string): string {
  const base = filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!base) return "Untitled recording";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function putWithProgress(
  url: string,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (file.type) xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status < 400
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      const valid = validateUpload({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      if (!valid.ok) {
        setStatus("error");
        setError(valid.reason);
        toast.error(valid.reason);
        return;
      }

      setStatus("uploading");
      setProgress(0);

      try {
        const res = await fetch("/api/recordings/upload-url", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });
        if (!res.ok) throw new Error("Could not start the upload.");
        const { key, uploadUrl } = (await res.json()) as {
          key: string;
          uploadUrl: string;
        };

        await putWithProgress(uploadUrl, file, setProgress);

        setStatus("finalizing");
        const finalizeRes = await fetch("/api/recordings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            key,
            title: deriveTitle(file.name),
            source: "upload",
          }),
        });
        if (!finalizeRes.ok) throw new Error("Could not finalize the upload.");
        const result = (await finalizeRes.json()) as { id?: string };

        setStatus("done");
        toast.success("Uploaded — Murmur is processing your recording.");
        if (result.id) {
          router.push(`/app/recordings/${result.id}`);
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong.");
        toast.error("Upload failed.");
      }
    },
    [router],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      // Ignore drops while an upload is in flight (avoids racing two files).
      if (status === "uploading" || status === "finalizing") return;
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile, status],
  );

  const busy = status === "uploading" || status === "finalizing";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an audio file"
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy)
            inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging
            ? "border-fg bg-bg-subtle"
            : "border-border hover:border-border-strong hover:bg-bg-subtle",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-fg">
          {status === "done" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : status === "error" ? (
            <AlertCircle className="h-6 w-6 text-danger" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </span>
        <div>
          <p className="text-base font-medium text-fg">
            {busy
              ? "Uploading…"
              : status === "done"
                ? "Upload complete"
                : "Drop an audio file, or click to choose"}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            mp3, m4a, wav, aac, ogg, webm — or a video to extract audio from.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Reset so re-selecting the same file after a failure re-fires.
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </div>

      {fileName && status !== "idle" ? (
        <div className="mt-4 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-fg">
            <FileAudio className="h-4 w-4 shrink-0 text-fg-muted" />
            <span className="truncate">{fileName}</span>
          </div>
          {busy ? (
            <div className="mt-3">
              <Progress value={Math.round(progress * 100)} />
              <p className="mt-1 text-xs text-fg-subtle">
                {status === "finalizing"
                  ? "Finalizing…"
                  : `${Math.round(progress * 100)}%`}
              </p>
            </div>
          ) : null}
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => setStatus("idle")}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
