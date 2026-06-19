/**
 * Embeddings for hybrid search + Ask RAG (MURMUR_CONTEXT.md §8). 1024-dim
 * vectors land in pgvector. The mock is deterministic; real adapters (Voyage /
 * OpenAI) arrive in Phase 19.
 */
export interface EmbeddingsProvider {
  readonly name: string;
  readonly dimensions: number;
  /** Embed a batch of texts → one vector per text (same order). */
  embed(texts: string[]): Promise<number[][]>;
  /** Embed a single query string. */
  embedOne(text: string): Promise<number[]>;
}
