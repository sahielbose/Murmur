import { index, pgTable, text, uuid, vector } from "drizzle-orm/pg-core";
import { embeddingKindEnum } from "./enums";
import { recordings } from "./recordings";
import { transcriptSegments } from "./transcript";
import { users } from "./users";
import { timestamps } from "./_helpers";

/**
 * Chunk embeddings for hybrid search + Ask RAG (MURMUR_CONTEXT.md §8-§9).
 * 1024-dim vectors (Voyage voyage-3.5 / mock) with an HNSW cosine index.
 */
export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    segmentId: uuid("segment_id").references(() => transcriptSegments.id, {
      onDelete: "cascade",
    }),
    chunkText: text("chunk_text").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    kind: embeddingKindEnum("kind").notNull(),
    ...timestamps,
  },
  (t) => [
    index("embeddings_recording_idx").on(t.recordingId),
    index("embeddings_user_idx").on(t.userId),
    index("embeddings_hnsw_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
