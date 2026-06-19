/**
 * Audio upload validation, shared by the client dropzone and the API routes.
 * Pure (no server deps) so it imports cleanly on both sides.
 */
export const ACCEPTED_AUDIO_EXTENSIONS = [
  "mp3",
  "m4a",
  "wav",
  "aac",
  "ogg",
  "webm",
  "mp4",
  "mov",
] as const;

const ACCEPTED_MIME_PREFIXES = ["audio/"];
const ACCEPTED_MIME_EXACT = [
  "video/mp4",
  "video/quicktime",
  "application/octet-stream",
];

/** Single-PUT cap for the local build. Larger files use R2 multipart (Phase 18). */
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

export function extensionOf(filename: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(filename);
  return m ? m[1]!.toLowerCase() : null;
}

export function isAcceptedAudio(
  filename: string,
  contentType?: string,
): boolean {
  const ext = extensionOf(filename);
  if (ext && (ACCEPTED_AUDIO_EXTENSIONS as readonly string[]).includes(ext)) {
    return true;
  }
  if (contentType) {
    if (ACCEPTED_MIME_PREFIXES.some((p) => contentType.startsWith(p))) {
      return true;
    }
    if (ACCEPTED_MIME_EXACT.includes(contentType)) return true;
  }
  return false;
}

export type ValidationResult = { ok: true } | { ok: false; reason: string };

export function validateUpload(input: {
  filename: string;
  contentType?: string;
  size?: number;
}): ValidationResult {
  if (!isAcceptedAudio(input.filename, input.contentType)) {
    return {
      ok: false,
      reason:
        "Unsupported file type. Upload an audio file (mp3, m4a, wav, aac, ogg, webm) or a video to extract audio from.",
    };
  }
  if (typeof input.size === "number") {
    if (input.size === 0) return { ok: false, reason: "That file is empty." };
    if (input.size > MAX_UPLOAD_BYTES) {
      return { ok: false, reason: "That file is too large (max 500 MB)." };
    }
  }
  return { ok: true };
}
