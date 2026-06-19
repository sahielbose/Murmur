import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getStorage } from "@murmur/ai";
import { getSession } from "@/lib/auth";

const EXT_RE = /\.([a-z0-9]+)$/i;

/**
 * Issue an upload target for a new audio object (MURMUR_CONTEXT.md §9). Returns
 * the storage key + a URL the browser uploads to (presigned PUT / local route).
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    filename?: string;
    contentType?: string;
  };
  const filename = (body.filename ?? "audio").trim();
  const ext = EXT_RE.exec(filename)?.[1]?.toLowerCase() ?? "webm";
  const key = `audio/${session.user.id}/${randomUUID()}.${ext}`;

  const signed = await getStorage().getUploadUrl(key, body.contentType);
  return NextResponse.json({
    key,
    uploadUrl: signed.url,
    method: signed.method,
  });
}
