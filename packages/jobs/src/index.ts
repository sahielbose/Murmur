import type { InngestFunction } from "inngest";
import { inngest } from "./client";
import { processRecording } from "./functions/process-recording";

/**
 * @murmur/jobs — Inngest functions: the recording-processing pipeline and the
 * scheduled resurfacing jobs (MURMUR_CONTEXT.md §7). The functions array is
 * served by the app's `/api/inngest` route.
 */
export { inngest };
export { runPipeline } from "./pipeline/run";
export * from "./events";

export const functions: InngestFunction.Any[] = [processRecording];
