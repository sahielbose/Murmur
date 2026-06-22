import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Runtime configuration the user sets from the app (e.g. their Anthropic API
 * key) without restarting. Persisted to a gitignored JSON file under `.data/`
 * and read fresh per call so a freshly-saved key takes effect immediately.
 */
export type RuntimeConfig = {
  /** Anthropic (Claude) — summaries, action items, mind maps, Ask, drafts. */
  anthropicApiKey?: string;
  /** ElevenLabs (Scribe) — speech-to-text + speaker diarization. */
  elevenLabsApiKey?: string;
  /** OpenAI — embeddings for semantic search + Ask retrieval. */
  openAiApiKey?: string;
  /** Optional Claude model override; defaults to claude-opus-4-8. */
  model?: string;
};

/** The `.data` directory, resolved independent of the process CWD. */
function dataDir(): string {
  if (process.env.MURMUR_CONFIG_DIR) {
    return resolve(process.env.MURMUR_CONFIG_DIR);
  }
  if (process.env.STORAGE_LOCAL_DIR) {
    return resolve(process.env.STORAGE_LOCAL_DIR, "..");
  }
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) break;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(dir, ".data");
}

function configPath(): string {
  return join(dataDir(), "runtime-config.json");
}

export function readRuntimeConfig(): RuntimeConfig {
  try {
    return JSON.parse(readFileSync(configPath(), "utf8")) as RuntimeConfig;
  } catch {
    return {};
  }
}

export function writeRuntimeConfig(
  patch: Partial<RuntimeConfig>,
): RuntimeConfig {
  const next: RuntimeConfig = { ...readRuntimeConfig(), ...patch };
  if (!next.anthropicApiKey) delete next.anthropicApiKey;
  if (!next.model) delete next.model;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(configPath(), JSON.stringify(next, null, 2));
  return next;
}

/** Resolve a provider key: env var wins, else the value saved in Settings. */
function resolveKey(envVar: string, field: keyof RuntimeConfig): string | null {
  const fromEnv = process.env[envVar]?.trim();
  if (fromEnv) return fromEnv;
  const saved = readRuntimeConfig()[field];
  return typeof saved === "string" && saved.trim() ? saved.trim() : null;
}

/** The active Anthropic key: env var wins, else the value saved in Settings. */
export function getAnthropicApiKey(): string | null {
  return resolveKey("ANTHROPIC_API_KEY", "anthropicApiKey");
}

export function getElevenLabsApiKey(): string | null {
  return resolveKey("ELEVENLABS_API_KEY", "elevenLabsApiKey");
}

export function getOpenAiApiKey(): string | null {
  return resolveKey("OPENAI_API_KEY", "openAiApiKey");
}

export function getConfiguredModel(): string {
  return readRuntimeConfig().model?.trim() || "claude-opus-4-8";
}
