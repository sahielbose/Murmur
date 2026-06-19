import { NextResponse, type NextRequest } from "next/server";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser } from "@/lib/recordings";
import { buildExportMarkdown } from "@/lib/export-content";
import { buildDocx, buildPdf, mdToPlainText, slugify } from "@/lib/export-doc";

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
  if (!rec) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const format = new URL(req.url).searchParams.get("format") ?? "md";
  const base = slugify(rec.title);
  const md = await buildExportMarkdown(id, rec.title);

  const attach = (body: BodyInit, type: string, ext: string): NextResponse =>
    new NextResponse(body, {
      headers: {
        "content-type": type,
        "content-disposition": `attachment; filename="${base}.${ext}"`,
      },
    });

  if (format === "md") {
    return attach(md, "text/markdown; charset=utf-8", "md");
  }
  if (format === "txt") {
    return attach(mdToPlainText(md), "text/plain; charset=utf-8", "txt");
  }
  if (format === "pdf") {
    const bytes = await buildPdf(rec.title, md);
    return attach(new Blob([new Uint8Array(bytes)]), "application/pdf", "pdf");
  }
  if (format === "docx") {
    const buf = await buildDocx(rec.title, md);
    return attach(
      new Blob([new Uint8Array(buf)]),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "docx",
    );
  }
  return NextResponse.json({ error: "unknown format" }, { status: 400 });
}
