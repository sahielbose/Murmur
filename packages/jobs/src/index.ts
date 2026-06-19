import type { InngestFunction } from "inngest";
import { inngest } from "./client";
import { processRecording } from "./functions/process-recording";
import { dailyHighlights } from "./functions/daily-highlights";

/**
 * @murmur/jobs — Inngest functions: the recording-processing pipeline and the
 * scheduled resurfacing jobs (MURMUR_CONTEXT.md §7). The functions array is
 * served by the app's `/api/inngest` route.
 */
export { inngest };
export { runPipeline } from "./pipeline/run";
export { enqueueProcessing } from "./enqueue";
export { buildDigestForUser, generateDailyDigests } from "./pipeline/digest";
export type { DigestItem } from "./pipeline/digest";
export * from "./events";

export const functions: InngestFunction.Any[] = [
  processRecording,
  dailyHighlights,
];
