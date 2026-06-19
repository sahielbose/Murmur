/**
 * @murmur/ai - the provider seam (MURMUR_CONTEXT.md §5). STT, LLM, embeddings,
 * and storage each expose an interface with a deterministic mock adapter;
 * real adapters are wired in Phases 18-20 and selected by env via the registry.
 */
export * from "./stt/types";
export * from "./llm/types";
export * from "./embeddings/types";
export * from "./storage/types";
export * from "./templates";
export * from "./registry";

export { mockStt } from "./stt/mock";
export { mockLlm } from "./llm/mock";
export { mockEmbeddings } from "./embeddings/mock";
export { localFileStorage } from "./storage/local";
