import { mockStt } from "./stt/mock";
import { mockLlm } from "./llm/mock";
import { mockEmbeddings } from "./embeddings/mock";
import { localFileStorage } from "./storage/local";
import type { SttProvider } from "./stt/types";
import type { LlmProvider } from "./llm/types";
import type { EmbeddingsProvider } from "./embeddings/types";
import type { Storage } from "./storage/types";

function warnFallback(kind: string, requested: string) {
  console.warn(
    `[murmur/ai] ${kind} provider "${requested}" is not wired yet - using the mock. TODO: implement in Phase 18-19.`,
  );
}

/**
 * Provider registry (MURMUR_CONTEXT.md §5). Each getter reads its env switch and
 * returns the selected adapter, falling back to the mock when a real provider is
 * requested but unavailable - so the app always boots.
 */
export function getStt(): SttProvider {
  const provider = process.env.STT_PROVIDER ?? "mock";
  if (provider !== "mock") warnFallback("STT", provider);
  return mockStt;
}

export function getLlm(): LlmProvider {
  const provider = process.env.LLM_PROVIDER ?? "mock";
  if (provider !== "mock") warnFallback("LLM", provider);
  return mockLlm;
}

export function getEmbeddings(): EmbeddingsProvider {
  const provider = process.env.EMBEDDINGS_PROVIDER ?? "mock";
  if (provider !== "mock") warnFallback("embeddings", provider);
  return mockEmbeddings;
}

export function getStorage(): Storage {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider !== "local") warnFallback("storage", provider);
  return localFileStorage;
}
