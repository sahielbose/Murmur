import { hashString } from "../util/seed";
import { tokenize, overlapScore } from "../util/text";
import type { TranscriptResult, TranscriptSegmentData } from "../stt/types";
import type {
  AskInput,
  AskResult,
  ActionItemsResult,
  DraftInput,
  DraftResult,
  GenerationInput,
  LlmProvider,
  MindMapResult,
  SummaryResult,
} from "./types";

const MODEL = "mock";

const COMMITMENT_TRIGGERS = [
  "i'll",
  "i will",
  "we'll",
  "let's",
  "send",
  "confirm",
  "review",
  "schedule",
  "share",
  "write up",
  "get you",
  "get back",
  "finalize",
];

function commitmentSegments(t: TranscriptResult): TranscriptSegmentData[] {
  return t.segments.filter((s) =>
    COMMITMENT_TRIGGERS.some((trig) => s.text.toLowerCase().includes(trig)),
  );
}

function cleanCommitment(text: string): string {
  // Take the clause around the commitment and tidy it up.
  const clause = text
    .split(/[.?!]/)
    .find((c) =>
      COMMITMENT_TRIGGERS.some((trig) => c.toLowerCase().includes(trig)),
    );
  const out = (clause ?? text).trim().replace(/^(and|so|but)\s+/i, "");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function topicLabel(text: string): string {
  const words = text
    .replace(/[.?!,]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 4).join(" ");
}

/**
 * Deterministic mock LLM. Derives summaries, action items, mind maps, and Ask
 * answers from the transcript with no external calls. Output varies by the
 * selected template/style so regeneration is visibly different.
 */
export const mockLlm: LlmProvider = {
  name: MODEL,

  async summarize(input: GenerationInput): Promise<SummaryResult> {
    const { transcript, title, templatePrompt, style } = input;
    const heading = title ?? "Conversation summary";
    const speakers = transcript.speakers.map((s) => s.label).join(", ");
    const discussed = transcript.segments
      .slice(0, 4)
      .map((s) => `- ${s.text}`)
      .join("\n");
    const commitments = commitmentSegments(transcript);
    const next = commitments.length
      ? commitments.map((c) => `- ${cleanCommitment(c.text)}`).join("\n")
      : "- No explicit next steps were identified.";

    // Vary section order by template so regenerate yields a different summary.
    const actionFirst = /action|to-?do|task/i.test(
      `${style ?? ""} ${templatePrompt ?? ""}`,
    );
    const styleNote = style ? `_Style: ${style}._\n\n` : "";

    const discussedBlock = `**What was discussed.**\n${discussed}`;
    const nextBlock = `**Next steps.**\n${next}`;
    const body = actionFirst
      ? `${nextBlock}\n\n${discussedBlock}`
      : `${discussedBlock}\n\n${nextBlock}`;

    const contentMd = `## ${heading}\n\n${styleNote}**Speakers.** ${speakers}.\n\n${body}`;
    return { contentMd, model: MODEL };
  },

  async extractActionItems(input: GenerationInput): Promise<ActionItemsResult> {
    const items = commitmentSegments(input.transcript).map((s) => ({
      text: cleanCommitment(s.text),
    }));
    return { items, model: MODEL };
  },

  async mindMap(input: GenerationInput): Promise<MindMapResult> {
    const { transcript, title } = input;
    const nodes = [{ id: "root", label: title ?? "Conversation", level: 0 }];
    const edges: { from: string; to: string }[] = [];

    const branchSegs = transcript.segments
      .filter((_, i) => i % 2 === 0)
      .slice(0, 4);
    branchSegs.forEach((s, i) => {
      const id = `b${i}`;
      nodes.push({ id, label: topicLabel(s.text), level: 1 });
      edges.push({ from: "root", to: id });
    });

    return { nodes, edges, model: MODEL };
  },

  async ask(input: AskInput): Promise<AskResult> {
    const { question, context } = input;
    if (context.length === 0) {
      return {
        answer: "I don't see that in your recordings.",
        citations: [],
        model: MODEL,
      };
    }

    const qTokens = tokenize(question);
    const scored = context
      .map((c) => ({ c, score: overlapScore(qTokens, tokenize(c.text)) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best || best.score === 0) {
      return {
        answer: "I don't see that in your recordings.",
        citations: [],
        model: MODEL,
      };
    }

    const top = scored.filter((s) => s.score > 0).slice(0, 2);
    // Touch the hash so output is stable but seed-aware if provided.
    void hashString(input.seed ?? question);

    return {
      answer: `From your recordings: ${best.c.text}`,
      citations: top.map((s) => ({
        recordingId: s.c.recordingId,
        startMs: s.c.startMs,
      })),
      model: MODEL,
    };
  },

  async draft(input: DraftInput): Promise<DraftResult> {
    void hashString(input.seed ?? input.commitment);
    const commitment = input.commitment.trim().replace(/\.$/, "");
    const lower = commitment.charAt(0).toLowerCase() + commitment.slice(1);
    const recipient = input.recipient?.trim() || "there";
    const source = input.recordingTitle
      ? ` (from our conversation, "${input.recordingTitle}")`
      : "";

    if (input.kind === "message") {
      return {
        subject: null,
        body: `Hi ${recipient} — quick follow-up${source}: I said I'd ${lower}. Wanted to flag it's on my list — I'll take care of it shortly. Anything you need from me first?`,
        model: MODEL,
      };
    }

    return {
      subject: `Following up: ${commitment}`,
      body: [
        `Hi ${recipient},`,
        "",
        `Following up on something I committed to${source}: I said I'd ${lower}.`,
        "",
        `I'm picking it up now and will let you know once it's done. If anything has changed on your end, just reply here.`,
        "",
        "Best,",
        "Alex",
      ].join("\n"),
      model: MODEL,
    };
  },
};
