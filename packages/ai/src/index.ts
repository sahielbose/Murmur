/**
 * @murmur/ai — the provider seam (MURMUR_CONTEXT.md §5). STT, LLM, embeddings,
 * and storage each expose an interface with a deterministic mock adapter;
 * real adapters are wired in Phases 18–20 and selected by env.
 */
export * from "./stt/types";
