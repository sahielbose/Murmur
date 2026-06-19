import { inngest } from "./client";
import { runPipeline } from "./pipeline/run";

/**
 * Kick off processing for a new recording. Uses the durable Inngest path when
 * configured (cloud / dev server via USE_INNGEST), otherwise runs the pipeline
 * inline in the background — which works on a long-running dev server in the
 * secret-free build with no Inngest dev server required.
 */
export async function enqueueProcessing(recordingId: string): Promise<void> {
  const useInngest =
    process.env.USE_INNGEST === "1" || Boolean(process.env.INNGEST_EVENT_KEY);

  if (useInngest) {
    await inngest.send({ name: "recording.created", data: { recordingId } });
    return;
  }

  void runPipeline(recordingId).catch((err) => {
    console.error(`[murmur/jobs] pipeline failed for ${recordingId}:`, err);
  });
}
