import { NextResponse, type NextRequest } from "next/server";
import { getDb, tags } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";
import { listTagsWithCounts } from "@/lib/tags";

const PALETTE = [
  "#0A0A0A",
  "#3F3F46",
  "#2563EB",
  "#16A34A",
  "#D97706",
  "#DC2626",
  "#7C3AED",
];

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listTagsWithCounts(user.id));
}

type CreateBody = { name?: string; color?: string };

export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as CreateBody;
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const color = body.color ?? PALETTE[Math.abs(hash(name)) % PALETTE.length]!;

  const [t] = await getDb()
    .insert(tags)
    .values({ userId: user.id, name, color })
    .onConflictDoNothing()
    .returning();
  if (!t) {
    return NextResponse.json({ error: "tag already exists" }, { status: 409 });
  }
  return NextResponse.json(t);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
