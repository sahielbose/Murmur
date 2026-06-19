import { NextResponse, type NextRequest } from "next/server";
import JSZip from "jszip";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser, listRecordingsForUser } from "@/lib/recordings";
import { buildExportMarkdown } from "@/lib/export-content";
import { buildDocx, buildPdf, mdToPlainText, slugify } from "@/lib/export-doc";

type Body = { recordingIds?: string[]; format?: string };

/** Bulk-export recordings as a single .zip (MURMUR_CONTEXT.md §3.7). */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const format = body.format ?? "md";
  const ids =
    body.recordingIds && body.recordingIds.length > 0
      ? body.recordingIds
      : (await listRecordingsForUser(user.id)).map((r) => r.id);

  const zip = new JSZip();
  const used = new Set<string>();
  for (const id of ids) {
    const rec = await getRecordingForUser(user.id, id);
    if (!rec) continue;
    let base = slugify(rec.title);
    while (used.has(base)) base = `${base}-2`;
    used.add(base);
    const md = await buildExportMarkdown(id, rec.title);
    if (format === "txt") zip.file(`${base}.txt`, mdToPlainText(md));
    else if (format === "pdf")
      zip.file(`${base}.pdf`, await buildPdf(rec.title, md));
    else if (format === "docx")
      zip.file(`${base}.docx`, await buildDocx(rec.title, md));
    else zip.file(`${base}.md`, md);
  }

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(new Blob([new Uint8Array(buf)]), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="murmur-export.zip"`,
    },
  });
}
