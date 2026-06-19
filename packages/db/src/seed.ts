import "./load-env";
import { sql } from "drizzle-orm";
import { getDb, closeDb } from "./client";
import {
  users,
  tags,
  templates,
  recordings,
  recordingSpeakers,
  transcriptSegments,
  summaries,
  actionItems,
  mindMaps,
  recordingTags,
  highlights,
  embeddings,
} from "./schema";
import type { MindMapGraph } from "./schema";
import { SYSTEM_TEMPLATES, mockEmbeddings } from "@murmur/ai";

type SeedSpeaker = { localLabel: string; displayName: string };
type SeedSegment = { speaker: number; startMs: number; text: string };

type SeedRecording = {
  title: string;
  source: "mic" | "upload";
  durationSec: number;
  recordedAt: string;
  tag: string;
  speakers: SeedSpeaker[];
  segments: SeedSegment[];
  summaryMd: string;
  actions: { text: string; owner?: string }[];
  mindMap: MindMapGraph;
};

const TAGS = [
  { name: "Home", color: "#D97706" },
  { name: "Work", color: "#3F3F46" },
  { name: "Health", color: "#16A34A" },
];

const RECORDINGS: SeedRecording[] = [
  {
    title: "Kitchen remodel — contractor walkthrough",
    source: "mic",
    durationSec: 1485,
    recordedAt: "2026-06-15T10:30:00Z",
    tag: "Home",
    speakers: [
      { localLabel: "Speaker 1", displayName: "Alex" },
      { localLabel: "Speaker 2", displayName: "Marco" },
    ],
    segments: [
      {
        speaker: 1,
        startMs: 0,
        text: "Thanks for coming by. Walk me through the bathroom first.",
      },
      {
        speaker: 0,
        startMs: 5200,
        text: "Sure. For the bathroom, the demo and re-tile runs about four thousand, plus fixtures.",
      },
      {
        speaker: 1,
        startMs: 12800,
        text: "And the cabinets in the kitchen — what brand were you quoting?",
      },
      {
        speaker: 0,
        startMs: 18400,
        text: "I had penciled in the mid-tier line, but send me the brand you liked and I'll re-price it.",
      },
      {
        speaker: 1,
        startMs: 26100,
        text: "Got it. When could the tile actually be delivered?",
      },
      {
        speaker: 0,
        startMs: 31500,
        text: "If we order this week, delivery lands the following Tuesday. I'll confirm the date.",
      },
    ],
    summaryMd:
      "## Kitchen remodel — contractor walkthrough\n\n**Scope.** Bathroom demo + re-tile (~$4,000 plus fixtures) and kitchen cabinets (mid-tier line, to be re-priced).\n\n**Decisions.**\n- Alex to choose the cabinet brand; Marco will re-quote.\n- Tile delivery the Tuesday after ordering, pending confirmation.\n\n**Open questions.**\n- Final plumbing cost — a second quote is worth getting.",
    actions: [
      { text: "Email Marco the cabinet brand to re-price", owner: "Alex" },
      { text: "Confirm the tile delivery date", owner: "Marco" },
      { text: "Get a second quote for the plumbing work", owner: "Alex" },
    ],
    mindMap: {
      nodes: [
        { id: "root", label: "Kitchen remodel", level: 0 },
        { id: "budget", label: "Budget", level: 1 },
        { id: "timeline", label: "Timeline", level: 1 },
        { id: "materials", label: "Materials", level: 1 },
        { id: "bath", label: "Bathroom ~$4k", level: 2 },
        { id: "cabinets", label: "Cabinets (re-price)", level: 2 },
        { id: "tile", label: "Tile — next Tuesday", level: 2 },
      ],
      edges: [
        { from: "root", to: "budget" },
        { from: "root", to: "timeline" },
        { from: "root", to: "materials" },
        { from: "budget", to: "bath" },
        { from: "materials", to: "cabinets" },
        { from: "timeline", to: "tile" },
      ],
    },
  },
  {
    title: "Product sync — weekly standup",
    source: "mic",
    durationSec: 920,
    recordedAt: "2026-06-16T09:00:00Z",
    tag: "Work",
    speakers: [
      { localLabel: "Speaker 1", displayName: "Alex" },
      { localLabel: "Speaker 2", displayName: "Priya" },
    ],
    segments: [
      {
        speaker: 1,
        startMs: 0,
        text: "Quick standup. Where are we on the auth migration?",
      },
      {
        speaker: 0,
        startMs: 4300,
        text: "Blocked on the token rotation change — I need review on the PR today.",
      },
      {
        speaker: 1,
        startMs: 10100,
        text: "I'll review it after this. Can you share the Q3 roadmap doc with the team?",
      },
      {
        speaker: 0,
        startMs: 16700,
        text: "Yes, I'll post it in the channel right after standup.",
      },
    ],
    summaryMd:
      "## Product sync — weekly standup\n\n**Status.** Auth migration is blocked on the token-rotation PR; review needed today.\n\n**Next.**\n- Priya to review the PR after standup.\n- Alex to share the Q3 roadmap with the team.",
    actions: [
      { text: "Review the token-rotation PR", owner: "Priya" },
      { text: "Share the Q3 roadmap doc in the channel", owner: "Alex" },
    ],
    mindMap: {
      nodes: [
        { id: "root", label: "Weekly standup", level: 0 },
        { id: "auth", label: "Auth migration", level: 1 },
        { id: "roadmap", label: "Q3 roadmap", level: 1 },
        { id: "pr", label: "Token-rotation PR (blocked)", level: 2 },
      ],
      edges: [
        { from: "root", to: "auth" },
        { from: "root", to: "roadmap" },
        { from: "auth", to: "pr" },
      ],
    },
  },
  {
    title: "Dr. Reyes — annual checkup",
    source: "upload",
    durationSec: 1320,
    recordedAt: "2026-06-12T14:00:00Z",
    tag: "Health",
    speakers: [
      { localLabel: "Speaker 1", displayName: "Alex" },
      { localLabel: "Speaker 2", displayName: "Dr. Reyes" },
    ],
    segments: [
      {
        speaker: 1,
        startMs: 0,
        text: "Your blood pressure today was a little high — let's recheck it with labs.",
      },
      {
        speaker: 0,
        startMs: 6400,
        text: "Okay. Do I need to fast before the labs?",
      },
      {
        speaker: 1,
        startMs: 11200,
        text: "Yes, fasting for the panel. And I'll send a refill for your prescription.",
      },
      {
        speaker: 0,
        startMs: 18900,
        text: "Great, I'll schedule the lab work this week.",
      },
    ],
    summaryMd:
      "## Dr. Reyes — annual checkup\n\n> Information, not medical advice. Follow up with your clinician.\n\n**Notes.**\n- Blood pressure slightly elevated today; recheck with labs.\n- Fasting panel ordered.\n- Prescription refill to be sent.\n\n**Follow-ups.**\n- Schedule fasting lab work this week.",
    actions: [
      { text: "Schedule the fasting lab work", owner: "Alex" },
      { text: "Pick up the prescription refill", owner: "Alex" },
    ],
    mindMap: {
      nodes: [
        { id: "root", label: "Annual checkup", level: 0 },
        { id: "bp", label: "Blood pressure", level: 1 },
        { id: "labs", label: "Labs (fasting)", level: 1 },
        { id: "rx", label: "Prescription refill", level: 1 },
      ],
      edges: [
        { from: "root", to: "bp" },
        { from: "root", to: "labs" },
        { from: "root", to: "rx" },
        { from: "bp", to: "labs" },
      ],
    },
  },
];

async function main() {
  const db = getDb();
  console.log("Resetting tables…");
  await db.execute(
    sql`TRUNCATE users, leads, templates RESTART IDENTITY CASCADE;`,
  );

  console.log("Seeding user…");
  const [user] = await db
    .insert(users)
    .values({
      email: "alex@murmur.app",
      name: "Alex Rivera",
      plan: "free",
    })
    .returning();
  if (!user) throw new Error("failed to seed user");

  console.log("Seeding system templates…");
  await db.insert(templates).values(
    SYSTEM_TEMPLATES.map((t) => ({
      userId: null,
      name: t.name,
      description: t.description,
      promptBody: t.promptBody,
      isSystem: true,
    })),
  );

  console.log("Seeding tags…");
  const tagRows = await db
    .insert(tags)
    .values(TAGS.map((t) => ({ ...t, userId: user.id })))
    .returning();
  const tagByName = new Map(tagRows.map((t) => [t.name, t.id]));

  console.log("Seeding recordings…");
  for (const r of RECORDINGS) {
    const [rec] = await db
      .insert(recordings)
      .values({
        userId: user.id,
        title: r.title,
        status: "done",
        source: r.source,
        language: "en",
        durationSec: r.durationSec,
        audioKey: null,
        recordedAt: new Date(r.recordedAt),
      })
      .returning();
    if (!rec) throw new Error("failed to seed recording");

    const speakerRows = await db
      .insert(recordingSpeakers)
      .values(
        r.speakers.map((s) => ({
          recordingId: rec.id,
          localLabel: s.localLabel,
          displayName: s.displayName,
        })),
      )
      .returning();

    const segmentRows = await db
      .insert(transcriptSegments)
      .values(
        r.segments.map((s) => ({
          recordingId: rec.id,
          recordingSpeakerId: speakerRows[s.speaker]?.id ?? null,
          startMs: s.startMs,
          endMs: s.startMs + 4000,
          text: s.text,
          confidence: 0.95,
        })),
      )
      .returning();

    const vectors = await mockEmbeddings.embed(segmentRows.map((s) => s.text));
    await db.insert(embeddings).values(
      segmentRows.map((s, i) => ({
        userId: user.id,
        recordingId: rec.id,
        segmentId: s.id,
        chunkText: s.text,
        embedding: vectors[i]!,
        kind: "segment" as const,
      })),
    );

    await db.insert(summaries).values({
      recordingId: rec.id,
      style: "Meeting notes",
      contentMd: r.summaryMd,
      isPrimary: true,
      model: "mock",
    });

    const actionRows = await db
      .insert(actionItems)
      .values(
        r.actions.map((a) => ({
          recordingId: rec.id,
          userId: user.id,
          text: a.text,
          owner: a.owner ?? null,
          status: "open" as const,
        })),
      )
      .returning();

    await db.insert(highlights).values(
      actionRows.slice(0, 2).map((a) => ({
        userId: user.id,
        recordingId: rec.id,
        kind: "commitment" as const,
        payload: {
          text: a.text,
          recordingTitle: r.title,
          actionItemId: a.id,
        },
      })),
    );

    await db.insert(mindMaps).values({ recordingId: rec.id, graph: r.mindMap });

    const tagId = tagByName.get(r.tag);
    if (tagId) {
      await db.insert(recordingTags).values({ recordingId: rec.id, tagId });
    }
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recordings);
  console.log(`Seed complete — ${count} recordings for ${user.email}.`);

  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
