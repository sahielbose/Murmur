import type { InngestFunction } from "inngest";
import { inngest } from "./client";

/**
 * @murmur/jobs — Inngest functions: the recording-processing pipeline and the
 * scheduled resurfacing jobs (MURMUR_CONTEXT.md §7). The functions array is
 * served by the app's `/api/inngest` route and populated across Phase 6.
 */
export { inngest };

export const functions: InngestFunction.Any[] = [];
