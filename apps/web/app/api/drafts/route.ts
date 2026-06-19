import { NextResponse, type NextRequest } from "next/server";
import { getLlm, type DraftKind } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";

type Body = {
  commitment?: string;
  kind?: DraftKind;
  recordingTitle?: string;
  recipient?: string;
};

/**
 * Generate a follow-up draft for review. APPROVAL-GATED: this only returns the
 * draft text - Murmur never sends anything on the user's behalf
 * (MURMUR_CONTEXT.md §11). Sending is a manual, integration-gated action.
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const commitment = body.commitment?.trim();
  if (!commitment) {
    return NextResponse.json(
      { error: "commitment is required" },
      { status: 400 },
    );
  }

  const draft = await getLlm().draft({
    commitment,
    kind: body.kind === "message" ? "message" : "email",
    recordingTitle: body.recordingTitle,
    recipient: body.recipient,
  });

  return NextResponse.json({
    subject: draft.subject,
    body: draft.body,
    sent: false,
  });
}
