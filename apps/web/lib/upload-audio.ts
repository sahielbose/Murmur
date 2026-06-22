/**
 * Upload an audio blob/file and finalize it into a recording (used by the live
 * recorder and the upload dropzone). Returns the new recording id.
 */
export async function uploadAudio(
  file: Blob,
  opts: {
    filename: string;
    title: string;
    source: "mic" | "upload" | "system";
    contentType?: string;
    durationSec?: number;
    /** Browser-captured live transcript segments, if any. */
    transcript?: {
      segments: { text: string; startMs: number; endMs: number }[];
    };
  },
): Promise<{ id?: string }> {
  const contentType = opts.contentType ?? file.type ?? "audio/webm";

  const urlRes = await fetch("/api/recordings/upload-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: opts.filename,
      contentType,
      size: file.size,
    }),
  });
  if (!urlRes.ok) throw new Error("Could not start the upload.");
  const { key, uploadUrl } = (await urlRes.json()) as {
    key: string;
    uploadUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "content-type": contentType },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload failed.");

  const finalizeRes = await fetch("/api/recordings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      key,
      title: opts.title,
      source: opts.source,
      durationSec: opts.durationSec,
      transcript: opts.transcript,
    }),
  });
  if (!finalizeRes.ok) throw new Error("Could not finalize the upload.");
  return (await finalizeRes.json()) as { id?: string };
}
