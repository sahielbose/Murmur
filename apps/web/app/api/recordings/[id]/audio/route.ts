import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser } from "@/lib/recordings";
import { slugify } from "@/lib/export-doc";

/**
 * Signed audio download (MURMUR_CONTEXT.md §9). Redirects to the storage
 * download URL (local route / R2 presigned) after an ownership check.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const rec = await getRecordingForUser(user.id, id);
  if (!rec?.audioKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  const storage = getStorage();
  // Force a download (Content-Disposition: attachment) when requested.
  if (new URL(req.url).searchParams.get("download")) {
    const bytes = await storage.get(rec.audioKey);
    const ext = rec.audioKey.split(".").pop() || "audio";
    return new NextResponse(new Blob([new Uint8Array(bytes)]), {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename="${slugify(rec.title)}.${ext}"`,
      },
    });
  }

  const signed = await storage.getDownloadUrl(rec.audioKey);
  return NextResponse.redirect(new URL(signed.url, req.url));
}
