import type { EmbeddingsProvider } from "./types";

const DIM = 1024;
const URL = "https://api.openai.com/v1/embeddings";
const DEFAULT_MODEL = "text-embedding-3-small";

/**
 * Real embeddings via OpenAI (text-embedding-3-small reduced to 1024 dims to
 * match the pgvector column). Powers semantic search + Ask retrieval when an
 * OpenAI key is configured.
 */
export function createOpenAiEmbeddings(
  apiKey: string,
  model: string = DEFAULT_MODEL,
): EmbeddingsProvider {
  async function call(input: string[]): Promise<number[][]> {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input, dimensions: DIM }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `OpenAI embeddings failed (${res.status}): ${detail.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as {
      data: { embedding: number[]; index: number }[];
    };
    return data.data
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }

  return {
    name: "openai",
    dimensions: DIM,
    async embed(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) return [];
      // Stay well under OpenAI's per-request input cap.
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += 96) {
        out.push(...(await call(texts.slice(i, i + 96))));
      }
      return out;
    },
    async embedOne(text: string): Promise<number[]> {
      const [v] = await call([text]);
      return v ?? new Array<number>(DIM).fill(0);
    },
  };
}

/** Validate an OpenAI key (used by Settings). */
export async function testOpenAiKey(
  apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        input: "ping",
        dimensions: DIM,
      }),
    });
    if (res.ok) return { ok: true };
    if (res.status === 401) return { ok: false, error: "Invalid API key." };
    return { ok: false, error: `OpenAI returned ${res.status}.` };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Connection failed.",
    };
  }
}
