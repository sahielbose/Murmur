import { persistTranscript, setStatus, transcribeRecording } from "./steps";

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
  // summarize / actions / mind map / embed → commits 4–5

  await setStatus(recordingId, "done");
}
