import { NextResponse, type NextRequest } from "next/server";
import {
  readRuntimeConfig,
  writeRuntimeConfig,
  testAnthropicKey,
  testElevenLabsKey,
  testOpenAiKey,
  type RuntimeConfig,
} from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";

type Provider = "anthropic" | "elevenlabs" | "openai";

const PROVIDERS: Record<
  Provider,
  {
    envVar: string;
    field: keyof RuntimeConfig;
    test: (key: string) => Promise<{ ok: boolean; error?: string }>;
  }
> = {
  anthropic: {
    envVar: "ANTHROPIC_API_KEY",
    field: "anthropicApiKey",
    test: testAnthropicKey,
  },
  elevenlabs: {
    envVar: "ELEVENLABS_API_KEY",
    field: "elevenLabsApiKey",
    test: testElevenLabsKey,
  },
  openai: {
    envVar: "OPENAI_API_KEY",
    field: "openAiApiKey",
    test: testOpenAiKey,
  },
};

function asProvider(p: string): Provider | null {
  return p === "anthropic" || p === "elevenlabs" || p === "openai" ? p : null;
}

function statusFor(p: Provider) {
  const cfg = PROVIDERS[p];
  const envKey = process.env[cfg.envVar]?.trim();
  const saved = readRuntimeConfig()[cfg.field];
  const active =
    envKey || (typeof saved === "string" ? saved.trim() : "") || "";
  return {
    configured: Boolean(active),
    source: envKey ? "env" : active ? "settings" : null,
    hint: active ? `…${active.slice(-4)}` : null,
    editable: !envKey,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  if (!(await getDbUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const provider = asProvider((await params).provider);
  if (!provider) {
    return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  }
  return NextResponse.json(statusFor(provider));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  if (!(await getDbUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const provider = asProvider((await params).provider);
  if (!provider) {
    return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  }
  const cfg = PROVIDERS[provider];
  if (process.env[cfg.envVar]?.trim()) {
    return NextResponse.json(
      { error: `This key is set via the ${cfg.envVar} environment variable.` },
      { status: 400 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { apiKey?: string };
  const key = body.apiKey?.trim();
  if (!key) {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }
  const test = await cfg.test(key);
  if (!test.ok) {
    return NextResponse.json(
      { error: test.error ?? "Could not validate the key." },
      { status: 400 },
    );
  }
  writeRuntimeConfig({ [cfg.field]: key });
  return NextResponse.json(statusFor(provider));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  if (!(await getDbUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const provider = asProvider((await params).provider);
  if (!provider) {
    return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  }
  const cfg = PROVIDERS[provider];
  if (process.env[cfg.envVar]?.trim()) {
    return NextResponse.json(
      {
        error: "This key is set via the environment and can't be removed here.",
      },
      { status: 400 },
    );
  }
  writeRuntimeConfig({ [cfg.field]: undefined });
  return NextResponse.json(statusFor(provider));
}
