import { NextResponse, type NextRequest } from "next/server";
import { getDbUser } from "@/lib/current-user";
import { getThreadMessages } from "@/lib/ask";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const messages = await getThreadMessages(user.id, id);
  if (!messages) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      citations: m.citations,
    })),
  });
}
