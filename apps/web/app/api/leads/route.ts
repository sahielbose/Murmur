import { NextResponse, type NextRequest } from "next/server";
import { getDb, leads } from "@murmur/db";

type Body = {
  name?: string;
  email?: string;
  company?: string;
  teamSize?: string;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Store an enterprise "talk to sales" lead (MURMUR_CONTEXT.md §9). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const name = body.name?.trim();
  const email = body.email?.trim();
  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "name and a valid email are required" },
      { status: 400 },
    );
  }

  await getDb()
    .insert(leads)
    .values({
      name,
      email,
      company: body.company?.trim() || null,
      teamSize: body.teamSize?.trim() || null,
      message: body.message?.trim() || null,
    });

  return NextResponse.json({ ok: true });
}
