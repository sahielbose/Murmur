import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getStorage } from "@murmur/ai";
import { getSession } from "@/lib/auth";
import { validateUpload, extensionOf } from "@/lib/audio";

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
    size?: number;
  };
  const filename = (body.filename ?? "audio").trim();

  const valid = validateUpload({
    filename,
    contentType: body.contentType,
    size: body.size,
  });
  if (!valid.ok) {
    return NextResponse.json({ error: valid.reason }, { status: 400 });
  }

  const ext = extensionOf(filename) ?? "webm";
  const key = `audio/${session.user.id}/${randomUUID()}.${ext}`;

  const signed = await getStorage().getUploadUrl(key, body.contentType);
  return NextResponse.json({
    key,
    uploadUrl: signed.url,
    method: signed.method,
  });
}
