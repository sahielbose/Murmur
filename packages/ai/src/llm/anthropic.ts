import Anthropic from "@anthropic-ai/sdk";
import type { TranscriptResult } from "../stt/types";
import type {
  ActionItemsResult,
  AskInput,
  AskResult,
  DraftInput,
  DraftResult,
  GenerationInput,
  LlmProvider,
  MindMapResult,
  SummaryResult,
} from "./types";

const DEFAULT_MODEL = "claude-opus-4-8";

/** Validate an API key with a tiny live request (used by Settings). */
export async function testAnthropicKey(
  apiKey: string,
  model: string = DEFAULT_MODEL,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model,
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true };
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status === 401) return { ok: false, error: "Invalid API key." };
    if (status === 403) return { ok: false, error: "Key lacks access." };
    const message = err instanceof Error ? err.message : "Connection failed.";
    return { ok: false, error: message };
  }
}

function transcriptToText(t: TranscriptResult): string {
  return t.segments.map((s) => `${s.speakerLabel}: ${s.text}`).join("\n");
}

function textOf(msg: Anthropic.Message): string {
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

/** Tolerantly extract JSON from a model response (handles ```json fences). */
function parseJson<T>(raw: string): T {
  let s = raw.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(s);
  if (fence?.[1]) s = fence[1].trim();
  const start = s.search(/[[{]/);
  if (start > 0) s = s.slice(start);
  return JSON.parse(s) as T;
}

/**
 * Real LLM provider backed by Anthropic Claude (claude-api skill). Powers
 * summaries, action items, mind maps, grounded Ask answers, and approval-gated
 * drafts when the user has configured an Anthropic API key.
 */
export function createAnthropicLlm(
  apiKey: string,
  model: string = DEFAULT_MODEL,
): LlmProvider {
  const client = new Anthropic({ apiKey });

  async function complete(
    system: string,
    user: string,
    maxTokens = 4096,
  ): Promise<string> {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });
    return textOf(msg);
  }

  return {
    name: "anthropic",

    async summarize(input: GenerationInput): Promise<SummaryResult> {
      const transcript = transcriptToText(input.transcript);
      const style = input.style
        ? ` Write it in this style: ${input.style}.`
        : "";
      const tmpl = input.templatePrompt
        ? `\n\nStructure the summary using this template:\n${input.templatePrompt}`
        : "";
      const system =
        `You are Murmur, an expert notetaker. Produce a clean, well-structured ` +
        `Markdown summary of the conversation: use headings and bullet points, lead ` +
        `with what matters, and stay faithful to what was said - never invent facts.` +
        style +
        tmpl;
      const user = `Title: ${input.title ?? "Conversation"}\n\nTranscript:\n${transcript}`;
      const contentMd = await complete(system, user, 4096);
      return { contentMd, model };
    },

    async extractActionItems(
      input: GenerationInput,
    ): Promise<ActionItemsResult> {
      const transcript = transcriptToText(input.transcript);
      const system =
        `Extract concrete action items (commitments, to-dos, follow-ups) from the ` +
        `conversation. Respond ONLY with JSON of the form ` +
        `{"items":[{"text":"...","owner":"name or null","dueAtISO":"ISO date or null"}]}. ` +
        `If there are none, return {"items":[]}.`;
      const raw = await complete(system, `Transcript:\n${transcript}`, 1500);
      try {
        const parsed = parseJson<{
          items?: {
            text?: string;
            owner?: string | null;
            dueAtISO?: string | null;
          }[];
        }>(raw);
        const items = (parsed.items ?? [])
          .filter((i) => i.text?.trim())
          .map((i) => ({
            text: i.text!.trim(),
            owner: i.owner ?? undefined,
            dueAtISO: i.dueAtISO ?? undefined,
          }));
        return { items, model };
      } catch {
        return { items: [], model };
      }
    },

    async mindMap(input: GenerationInput): Promise<MindMapResult> {
      const transcript = transcriptToText(input.transcript);
      const system =
        `Build a radial mind map of the conversation's topics. Respond ONLY with JSON ` +
        `of the form {"nodes":[{"id":"root","label":"<short title>","level":0},` +
        `{"id":"n1","label":"...","level":1}],"edges":[{"from":"root","to":"n1"}]}. ` +
        `Include exactly one root (level 0), 3-6 main branches (level 1), and optional ` +
        `sub-nodes (level 2). Keep labels to a few words.`;
      const raw = await complete(
        system,
        `Title: ${input.title ?? "Conversation"}\n\nTranscript:\n${transcript}`,
        1500,
      );
      try {
        const parsed = parseJson<MindMapResult>(raw);
        if (parsed.nodes?.length) {
          return { nodes: parsed.nodes, edges: parsed.edges ?? [], model };
        }
      } catch {
        /* fall through to a minimal map */
      }
      return {
        nodes: [{ id: "root", label: input.title ?? "Conversation", level: 0 }],
        edges: [],
        model,
      };
    },

    async ask(input: AskInput): Promise<AskResult> {
      if (input.context.length === 0) {
        return {
          answer: "I don't see that in your recordings.",
          citations: [],
          model,
        };
      }
      const ctx = input.context
        .map(
          (c, i) =>
            `[${i}] (recordingId=${c.recordingId} startMs=${c.startMs}) ${c.text}`,
        )
        .join("\n");
      const system =
        `Answer the user's question using ONLY the provided context from their own ` +
        `recordings. If the answer is not in the context, reply exactly: ` +
        `"I don't see that in your recordings." Cite the context chunks you used by ` +
        `their [index]. Respond ONLY with JSON: {"answer":"...","citations":[<chunk indexes>]}.`;
      const raw = await complete(
        system,
        `Context:\n${ctx}\n\nQuestion: ${input.question}`,
        1024,
      );
      try {
        const parsed = parseJson<{ answer?: string; citations?: number[] }>(
          raw,
        );
        const citations = (parsed.citations ?? [])
          .filter(
            (i) => Number.isInteger(i) && i >= 0 && i < input.context.length,
          )
          .map((i) => ({
            recordingId: input.context[i]!.recordingId,
            startMs: input.context[i]!.startMs,
          }));
        return {
          answer:
            parsed.answer?.trim() || "I don't see that in your recordings.",
          citations,
          model,
        };
      } catch {
        return { answer: raw, citations: [], model };
      }
    },

    async draft(input: DraftInput): Promise<DraftResult> {
      const src = input.recordingTitle
        ? ` (from the conversation "${input.recordingTitle}")`
        : "";
      const shape =
        input.kind === "message"
          ? '{"subject":null,"body":"..."}'
          : '{"subject":"...","body":"..."}';
      const system =
        `Draft a short, professional ${input.kind === "message" ? "message" : "email"} ` +
        `following up on a commitment the user made${src}. The user will review and ` +
        `send it themselves, so write it ready-to-send and never claim it was already ` +
        `sent. Respond ONLY with JSON: ${shape}.`;
      const raw = await complete(
        system,
        `Commitment: ${input.commitment}\nRecipient: ${input.recipient ?? "the relevant person"}`,
        1024,
      );
      try {
        const parsed = parseJson<{ subject?: string | null; body?: string }>(
          raw,
        );
        return {
          subject: input.kind === "message" ? null : (parsed.subject ?? null),
          body: parsed.body ?? raw,
          model,
        };
      } catch {
        return {
          subject:
            input.kind === "message"
              ? null
              : `Following up: ${input.commitment}`,
          body: raw,
          model,
        };
      }
    },
  };
}
