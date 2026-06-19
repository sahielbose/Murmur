import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@murmur/ai";
import { getSession } from "@/lib/auth";

/**
 * Finalize an upload (MURMUR_CONTEXT.md §9). For now this validates the uploaded
 * object exists; creating the recording row and enqueueing the pipeline is wired
 * in a later commit.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { key?: string };
  if (!body.key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  if (!(await getStorage().exists(body.key))) {
    return NextResponse.json(
      { error: "uploaded object not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ key: body.key, ready: true });
}
