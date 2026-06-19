import {
  generateActionItems,
  generateSummary,
  persistTranscript,
  setStatus,
  transcribeRecording,
} from "./steps";

/**
 * Plain sequential orchestrator mirroring the Inngest `processRecording`
 * function — used for direct invocation and end-to-end verification without the
 * durable runtime. Remaining step bodies are filled in across the next commits.
 */
export async function runPipeline(recordingId: string): Promise<void> {
  await setStatus(recordingId, "transcribing");
  const transcript = await transcribeRecording(recordingId);
  await persistTranscript(recordingId, transcript);

  await setStatus(recordingId, "summarizing");
  await Promise.all([
    generateSummary(recordingId, transcript),
    generateActionItems(recordingId, transcript),
  ]);
  // mind map / embed → commit 5

  await setStatus(recordingId, "done");
}
