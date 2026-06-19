import { NextResponse, type NextRequest } from "next/server";
import { getDb, templates } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";
import { listTemplatesForUser } from "@/lib/templates";

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const list = await listTemplatesForUser(user.id);
  return NextResponse.json(list);
}

type CreateBody = { name?: string; description?: string; promptBody?: string };

export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as CreateBody;
  if (!body.name?.trim() || !body.promptBody?.trim()) {
    return NextResponse.json(
      { error: "name and instructions are required" },
      { status: 400 },
    );
  }
  const [t] = await getDb()
    .insert(templates)
    .values({
      userId: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      promptBody: body.promptBody.trim(),
      isSystem: false,
    })
    .returning();
  return NextResponse.json({ id: t!.id });
}
