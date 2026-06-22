import { NextResponse, type NextRequest } from "next/server";
import {
  readRuntimeConfig,
  writeRuntimeConfig,
  testAnthropicKey,
} from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";

function status() {
  const envKey = process.env.ANTHROPIC_API_KEY?.trim();
  const cfgKey = readRuntimeConfig().anthropicApiKey?.trim();
  const active = envKey || cfgKey || null;
  return {
    configured: Boolean(active),
    source: envKey ? "env" : cfgKey ? "settings" : null,
    hint: active ? `…${active.slice(-4)}` : null,
    // An env-provided key is managed outside the app and can't be edited here.
    editable: !envKey,
  };
}

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(status());
}

export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error: "The key is set via the ANTHROPIC_API_KEY environment variable.",
      },
      { status: 400 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { apiKey?: string };
  const key = body.apiKey?.trim();
  if (!key) {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }
  // Validate before persisting so a bad key is never stored.
  const test = await testAnthropicKey(key);
  if (!test.ok) {
    return NextResponse.json(
      { error: test.error ?? "Could not validate the key." },
      { status: 400 },
    );
  }
  writeRuntimeConfig({ anthropicApiKey: key });
  return NextResponse.json(status());
}

export async function DELETE() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error: "The key is set via the environment and can't be removed here.",
      },
      { status: 400 },
    );
  }
  writeRuntimeConfig({ anthropicApiKey: undefined });
  return NextResponse.json(status());
}
