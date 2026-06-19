import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@murmur/ai";
import { getSession } from "@/lib/auth";

/**
 * Local-filesystem storage endpoint — the target of the local Storage adapter's
 * upload/download URLs (mirrors R2 presigned URLs in the secret-free build).
 * The catch-all segment is the encoded object key. Access is gated to the
 * signed-in user who owns the key: object keys are namespaced `audio/<userId>/…`
 * and the `<userId>` segment must match the caller's session.
 */
function objectKeyFrom(key: string[]): string {
  return key.map((s) => decodeURIComponent(s)).join("/");
}

/** Require a session that owns the namespaced object key, else a Response. */
async function authorize(objectKey: string): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parts = objectKey.split("/");
  // Enforce ownership for the user-namespaced `audio/<userId>/…` keys.
  if (parts[0] === "audio" && parts[1] !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = objectKeyFrom(key);
  const denied = await authorize(objectKey);
  if (denied) return denied;

  const data = new Uint8Array(await req.arrayBuffer());
  await getStorage().put(
    objectKey,
    data,
    req.headers.get("content-type") ?? undefined,
  );
  return NextResponse.json({ ok: true, key: objectKey });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = objectKeyFrom(key);
  const denied = await authorize(objectKey);
  if (denied) return denied;

  const storage = getStorage();
  if (!(await storage.exists(objectKey))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const data = await storage.get(objectKey);
  // Re-wrap into an ArrayBuffer-backed view so the body is a valid BodyInit.
  const body = new Uint8Array(data);
  return new NextResponse(new Blob([body]), {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "private, max-age=3600",
    },
  });
}
