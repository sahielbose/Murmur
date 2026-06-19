/** A diarized speaker as returned by transcription ("Speaker 1", …). */
export type TranscriptSpeaker = { label: string };

export type TranscriptSegmentData = {
  speakerLabel: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
};

export type TranscriptResult = {
  language: string;
  durationSec: number;
  speakers: TranscriptSpeaker[];
  segments: TranscriptSegmentData[];
};

export type TranscribeInput = {
  /** Storage key (or path/URL) of the audio to transcribe. */
  audioKey: string;
  /** Optional language hint; otherwise auto-detect. */
  language?: string;
  /** Stable seed for deterministic mock output (e.g. the recording id). */
  seed?: string;
};

/** An interim/final partial pushed to the live view during streaming capture. */
export type StreamingPartial = { text: string; isFinal: boolean };

/**
 * Speech-to-text + diarization (MURMUR_CONTEXT.md §4.2, §5). `transcribe` is the
 * authoritative batch pass; `transcribeStream` powers the live transcript only.
 */
export interface SttProvider {
  readonly name: string;
  transcribe(input: TranscribeInput): Promise<TranscriptResult>;
  transcribeStream?(
    chunks: AsyncIterable<Uint8Array>,
    opts?: { language?: string; seed?: string },
  ): AsyncIterable<StreamingPartial>;
}
