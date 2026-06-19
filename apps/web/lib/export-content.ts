import { getPrimarySummary } from "./recordings";
import { getActionItemsForRecording } from "./action-items";

/** Assemble a recording's export Markdown: title + summary + action items. */
export async function buildExportMarkdown(
  recordingId: string,
  title: string,
): Promise<string> {
  const summary = await getPrimarySummary(recordingId);
  const items = await getActionItemsForRecording(recordingId);
  const parts = [`# ${title}`, "", summary?.contentMd ?? "_No summary yet._"];
  if (items.length > 0) {
    parts.push("", "## Action items", "");
    for (const it of items) {
      parts.push(`- [${it.status === "done" ? "x" : " "}] ${it.text}`);
    }
  }
  return parts.join("\n");
}
