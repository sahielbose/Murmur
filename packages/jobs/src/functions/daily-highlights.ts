import { inngest } from "../client";
import { generateDailyDigests } from "../pipeline/digest";

/**
 * Daily resurfacing job (MURMUR_CONTEXT.md §10): each morning, build every
 * user's digest of commitments to revisit. Surfacing only — any outbound nudge
 * (email/push) stays approval-gated and is wired with the real providers later.
 */
export const dailyHighlights = inngest.createFunction(
  {
    id: "daily-highlights",
    name: "Daily highlights resurfacing",
    triggers: [{ cron: "TZ=America/Los_Angeles 0 8 * * *" }],
  },
  async ({ step }) => {
    const dateKey = await step.run("date-key", () =>
      new Date().toISOString().slice(0, 10),
    );
    const built = await step.run("build-digests", () =>
      generateDailyDigests(dateKey),
    );
    return { dateKey, digests: built };
  },
);
