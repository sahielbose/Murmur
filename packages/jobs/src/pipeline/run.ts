import {
  embedRecording,
  emitHighlights,
  failRecording,
  generateActionItems,
  generateMindMap,
  generateSummary,
  persistTranscript,
  setStatus,
  transcribeRecording,
} from "./steps";

/**
 * Plain sequential orchestrator mirroring the Inngest `processRecording`
 * function - used for direct invocation and end-to-end verification without the
 * durable runtime. Each step is idempotent (delete-then-insert), so re-running
 * is safe; on error the recording is flagged `failed` with a reason.
 */
export async function runPipeline(recordingId: string): Promise<void> {
  try {
    await setStatus(recordingId, "transcribing");
    const transcript = await transcribeRecording(recordingId);
    await persistTranscript(recordingId, transcript);

    await setStatus(recordingId, "summarizing");
    await Promise.all([
      generateSummary(recordingId, transcript),
      generateActionItems(recordingId, transcript),
      generateMindMap(recordingId, transcript),
      embedRecording(recordingId),
    ]);

    await emitHighlights(recordingId);
    await setStatus(recordingId, "done");
  } catch (err) {
    await failRecording(
      recordingId,
      err instanceof Error ? err.message : String(err),
    );
    throw err;
  }
}
