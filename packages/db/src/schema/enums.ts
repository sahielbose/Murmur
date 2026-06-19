import { pgEnum } from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "enterprise"]);

export const recordingStatusEnum = pgEnum("recording_status", [
  "recording",
  "uploaded",
  "transcribing",
  "summarizing",
  "done",
  "failed",
]);

export const recordingSourceEnum = pgEnum("recording_source", [
  "mic",
  "upload",
  "system",
]);

export const actionItemStatusEnum = pgEnum("action_item_status", [
  "open",
  "done",
]);
