import { hashString, mulberry32 } from "../util/seed";
import { SCRIPTS } from "./scripts";
import type {
  SttProvider,
  StreamingPartial,
  TranscribeInput,
  TranscriptResult,
  TranscriptSegmentData,
} from "./types";

/**
 * Deterministic mock STT. Picks a canned conversation from the seed, lays it out
 * with plausible timestamps, and reports diarized speakers. Same seed → same
 * transcript, every run.
 */
export const mockStt: SttProvider = {
  name: "mock",

  async transcribe(input: TranscribeInput): Promise<TranscriptResult> {
    const key = input.seed ?? input.audioKey ?? "default";
    const rng = mulberry32(hashString(key));
    const script = SCRIPTS[hashString(key) % SCRIPTS.length]!;

    let t = 0;
    const segments: TranscriptSegmentData[] = script.lines.map((line) => {
      const durMs = 2800 + Math.floor(rng() * 4200);
      const seg: TranscriptSegmentData = {
        speakerLabel: `Speaker ${line.speaker + 1}`,
        startMs: t,
        endMs: t + durMs,
        text: line.text,
        confidence: Number((0.9 + rng() * 0.09).toFixed(3)),
      };
      t += durMs + Math.floor(rng() * 900);
      return seg;
    });

    const speakerCount = new Set(script.lines.map((l) => l.speaker)).size;

    return {
      language: input.language ?? "en",
      durationSec: Math.round(t / 1000),
      speakers: Array.from({ length: speakerCount }, (_, i) => ({
        label: `Speaker ${i + 1}`,
      })),
      segments,
    };
  },

  async *transcribeStream(
    _chunks: AsyncIterable<Uint8Array>,
    opts?: { language?: string; seed?: string },
  ): AsyncIterable<StreamingPartial> {
    const key = opts?.seed ?? "default";
    const script = SCRIPTS[hashString(key) % SCRIPTS.length]!;
    // Emit each line as a few interim partials then a final, ignoring the raw
    // audio chunks (the authoritative transcript comes from the batch pass).
    for (const line of script.lines) {
      const words = line.text.split(" ");
      let acc = "";
      for (const w of words) {
        acc = acc ? `${acc} ${w}` : w;
        yield { text: acc, isFinal: false };
      }
      yield { text: line.text, isFinal: true };
    }
  },
};
