import type { TranscriptResult } from "../stt/types";

export type GenerationInput = {
  transcript: TranscriptResult;
  title?: string;
  /** The selected template's prompt body, injected into the system prompt. */
  templatePrompt?: string;
  style?: string;
  seed?: string;
};

export type SummaryResult = { contentMd: string; model: string };

export type ActionItemData = {
  text: string;
  owner?: string;
  dueAtISO?: string;
};
export type ActionItemsResult = { items: ActionItemData[]; model: string };

export type MindMapNodeData = { id: string; label: string; level: number };
export type MindMapEdgeData = { from: string; to: string };
export type MindMapResult = {
  nodes: MindMapNodeData[];
  edges: MindMapEdgeData[];
  model: string;
};

/** A retrieved chunk passed to Ask as grounding context. */
export type AskContextChunk = {
  recordingId: string;
  startMs: number;
  text: string;
};

export type AskInput = {
  question: string;
  context: AskContextChunk[];
  seed?: string;
};

export type AskCitation = { recordingId: string; startMs: number };

export type AskResult = {
  answer: string;
  citations: AskCitation[];
  model: string;
};

/**
 * Text generation for summaries, action items, mind maps, and grounded Ask
 * (MURMUR_CONTEXT.md §8). Ask must never answer beyond the retrieved context.
 */
export interface LlmProvider {
  readonly name: string;
  summarize(input: GenerationInput): Promise<SummaryResult>;
  extractActionItems(input: GenerationInput): Promise<ActionItemsResult>;
  mindMap(input: GenerationInput): Promise<MindMapResult>;
  ask(input: AskInput): Promise<AskResult>;
}
