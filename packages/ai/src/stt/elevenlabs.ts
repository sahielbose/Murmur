import type {
  SttProvider,
  TranscribeInput,
  TranscriptResult,
  TranscriptSegmentData,
} from "./types";

const SCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text";

type ScribeWord = {
  text?: string;
  start?: number;
  end?: number;
  type?: string;
  speaker_id?: string;
};
type ScribeResponse = {
  language_code?: string;
  text?: string;
  words?: ScribeWord[];
};

function mimeFor(key: string): string {
  switch (key.split(".").pop()?.toLowerCase()) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "ogg":
      return "audio/ogg";
    case "aac":
      return "audio/aac";
    default:
      return "audio/webm";
  }
}

function speakerLabel(
  id: string | undefined,
  map: Map<string, string>,
): string {
  const key = id ?? "speaker_0";
  if (!map.has(key)) map.set(key, `Speaker ${map.size + 1}`);
  return map.get(key)!;
}

/** Group diarized words into speaker turns, splitting long turns on sentences. */
function buildSegments(words: ScribeWord[]): {
  segments: TranscriptSegmentData[];
  speakers: string[];
} {
  const map = new Map<string, string>();
  const segments: TranscriptSegmentData[] = [];
  let cur: {
    speaker: string;
    startMs: number;
    endMs: number;
    text: string;
  } | null = null;

  const flush = () => {
    if (cur && cur.text.trim()) {
      segments.push({
        speakerLabel: cur.speaker,
        startMs: cur.startMs,
        endMs: cur.endMs,
        text: cur.text.trim(),
        confidence: 0.9,
      });
    }
    cur = null;
  };

  for (const w of words) {
    if (w.type === "spacing") {
      if (cur) cur.text += " ";
      continue;
    }
    const text = (w.text ?? "").trim();
    if (!text) continue;
    const speaker = speakerLabel(w.speaker_id, map);
    const startMs = Math.round((w.start ?? 0) * 1000);
    const endMs = Math.round((w.end ?? w.start ?? 0) * 1000);
    if (!cur || cur.speaker !== speaker) {
      flush();
      cur = { speaker, startMs, endMs, text };
    } else {
      cur.text += cur.text.endsWith(" ") ? text : ` ${text}`;
      cur.endMs = endMs;
    }
    // Keep turns readable: break at sentence ends once they get long.
    if (/[.?!]$/.test(text) && cur && cur.endMs - cur.startMs > 8000) {
      flush();
    }
  }
  flush();

  const speakers = [...map.values()];
  return { segments, speakers: speakers.length ? speakers : ["Speaker 1"] };
}

/**
 * Real speech-to-text via ElevenLabs Scribe, with speaker diarization and word
 * timestamps. The pipeline calls this on the recorded audio when an ElevenLabs
 * key is configured.
 */
export function createElevenLabsStt(apiKey: string): SttProvider {
  return {
    name: "elevenlabs",
    async transcribe(input: TranscribeInput): Promise<TranscriptResult> {
      const { getStorage } = await import("../registry");
      const bytes = await getStorage().get(input.audioKey);

      const form = new FormData();
      form.append("model_id", "scribe_v1");
      form.append("diarize", "true");
      form.append("timestamps_granularity", "word");
      if (input.language) form.append("language_code", input.language);
      form.append(
        "file",
        new Blob([new Uint8Array(bytes)], { type: mimeFor(input.audioKey) }),
        "audio",
      );

      const res = await fetch(SCRIBE_URL, {
        method: "POST",
        headers: { "xi-api-key": apiKey },
        body: form,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(
          `ElevenLabs STT failed (${res.status}): ${detail.slice(0, 200)}`,
        );
      }
      const data = (await res.json()) as ScribeResponse;
      const { segments, speakers } = buildSegments(data.words ?? []);
      const durationSec = segments.length
        ? Math.ceil(segments[segments.length - 1]!.endMs / 1000)
        : 0;

      if (segments.length === 0 && data.text?.trim()) {
        return {
          language: data.language_code ?? input.language ?? "en",
          durationSec,
          speakers: [{ label: "Speaker 1" }],
          segments: [
            {
              speakerLabel: "Speaker 1",
              startMs: 0,
              endMs: durationSec * 1000,
              text: data.text.trim(),
              confidence: 0.9,
            },
          ],
        };
      }

      return {
        language: data.language_code ?? input.language ?? "en",
        durationSec,
        speakers: speakers.map((label) => ({ label })),
        segments,
      };
    },
  };
}

/** Validate an ElevenLabs key (used by Settings). */
export async function testElevenLabsKey(
  apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": apiKey },
    });
    if (res.ok) return { ok: true };
    if (res.status === 401) return { ok: false, error: "Invalid API key." };
    return { ok: false, error: `ElevenLabs returned ${res.status}.` };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Connection failed.",
    };
  }
}
