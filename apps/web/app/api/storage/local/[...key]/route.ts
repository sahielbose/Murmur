import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@murmur/ai";

/**
 * Local-filesystem storage endpoint — the target of the local Storage adapter's
 * upload/download URLs (mirrors R2 presigned URLs in the secret-free build).
 * The catch-all segment is the encoded object key.
 */
function objectKeyFrom(key: string[]): string {
  return key.map((s) => decodeURIComponent(s)).join("/");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = objectKeyFrom(key);
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
  const storage = getStorage();
  if (!(await storage.exists(objectKey))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const data = await storage.get(objectKey);
  return new NextResponse(new Blob([data]), {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "private, max-age=3600",
    },
  });
}
