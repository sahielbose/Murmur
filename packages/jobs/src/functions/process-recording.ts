import { inngest } from "../client";
import type { RecordingCreatedData } from "../events";
import {
  persistTranscript,
  setStatus,
  transcribeRecording,
} from "../pipeline/steps";

/**
 * The recording-processing pipeline (MURMUR_CONTEXT.md §7). Skeleton with status
 * transitions; the transcribe / summarize / actions / mind-map / embed steps are
 * filled in across the next commits. Each step is durable and retryable.
 */
export const processRecording = inngest.createFunction(
  {
    id: "process-recording",
    name: "Process recording",
    retries: 3,
    triggers: [{ event: "recording.created" }],
  },
  async ({ event, step }) => {
    const { recordingId } = event.data as RecordingCreatedData;

    await step.run("set-transcribing", () =>
      setStatus(recordingId, "transcribing"),
    );

    const transcript = await step.run("transcribe", () =>
      transcribeRecording(recordingId),
    );
    await step.run("persist-transcript", () =>
      persistTranscript(recordingId, transcript),
    );

    await step.run("set-summarizing", () =>
      setStatus(recordingId, "summarizing"),
    );

    // summarize / action items / mind map / embed → commits 4–5

    await step.run("mark-done", () => setStatus(recordingId, "done"));

    return { recordingId, status: "done" as const };
  },
);
