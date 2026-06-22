import { mockStt } from "./stt/mock";
import { mockLlm } from "./llm/mock";
import { createAnthropicLlm } from "./llm/anthropic";
import { mockEmbeddings } from "./embeddings/mock";
import { localFileStorage } from "./storage/local";
import { getAnthropicApiKey, getConfiguredModel } from "./config/runtime";
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
  // Force the mock when explicitly requested (tests / offline dev).
  if (process.env.LLM_PROVIDER === "mock") return mockLlm;
  // Use real Anthropic Claude as soon as an API key is configured (env or the
  // key saved in Settings); otherwise fall back to the deterministic mock.
  const key = getAnthropicApiKey();
  if (key) return createAnthropicLlm(key, getConfiguredModel());
  return mockLlm;
}

/** Whether the real Anthropic LLM is active (an API key is configured). */
export function isAnthropicConfigured(): boolean {
  return process.env.LLM_PROVIDER !== "mock" && getAnthropicApiKey() !== null;
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
