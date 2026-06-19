import { Inngest } from "inngest";

/**
 * The Murmur Inngest client (MURMUR_CONTEXT.md §7). In local dev the Inngest
 * dev server discovers the `/api/inngest` endpoint; Inngest Cloud is wired in
 * Phase 19 via signing/event keys.
 */
export const inngest = new Inngest({ id: "murmur" });
