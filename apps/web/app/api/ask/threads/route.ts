import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/current-user";
import { listThreads } from "@/lib/ask";

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const threads = await listThreads(user.id);
  return NextResponse.json(threads.map((t) => ({ id: t.id, title: t.title })));
}
