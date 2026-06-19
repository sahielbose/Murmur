import { index, jsonb, pgTable, uuid } from "drizzle-orm/pg-core";
import { recordings } from "./recordings";
import { timestamps } from "./_helpers";

export type MindMapNode = {
  id: string;
  label: string;
  /** 0 = root, 1 = branch, 2 = leaf. */
  level: number;
};

export type MindMapEdge = {
  from: string;
  to: string;
};

export type MindMapGraph = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
};

export const mindMaps = pgTable(
  "mind_maps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    graph: jsonb("graph").$type<MindMapGraph>().notNull(),
    ...timestamps,
  },
  (t) => [index("mind_maps_recording_idx").on(t.recordingId)],
);

export type MindMap = typeof mindMaps.$inferSelect;
export type NewMindMap = typeof mindMaps.$inferInsert;
