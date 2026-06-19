import { hashString } from "../util/seed";
import { tokenize } from "../util/text";
import type { EmbeddingsProvider } from "./types";

const DIM = 1024;

/**
 * Deterministic bag-of-words embedding hashed into DIM buckets and
 * L2-normalized, so cosine similarity tracks token overlap. Good enough for
 * mock semantic search + RAG ranking; same text → same vector.
 */
function embedText(text: string): number[] {
  const v = new Array<number>(DIM).fill(0);
  for (const tok of tokenize(text)) {
    const h = hashString(tok);
    v[h % DIM] += 1;
    v[(h >>> 10) % DIM] += 0.5;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

export const mockEmbeddings: EmbeddingsProvider = {
  name: "mock",
  dimensions: DIM,
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(embedText);
  },
  async embedOne(text: string): Promise<number[]> {
    return embedText(text);
  },
};
