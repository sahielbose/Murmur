import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/current-user";
import {
  getPrimarySummary,
  getMindMap,
  getRecordingForUser,
  getRecordingTags,
  getTranscript,
} from "@/lib/recordings";
import { listTemplatesForUser } from "@/lib/templates";
import { getActionItemsForRecording } from "@/lib/action-items";
import { MindMapCanvas } from "@/components/app/recording/mind-map-canvas";
import { SummaryTab } from "@/components/app/recording/summary-tab";
import { TranscriptTab } from "@/components/app/recording/transcript-tab";
import { ActionItemsTab } from "@/components/app/recording/action-items-tab";
import {
  FailedPanel,
  ProcessingPanel,
} from "@/components/app/recording/recording-status";
import { RecordingHeader } from "@/components/app/recording/recording-header";
import { RecordingAudioProvider } from "@/components/app/recording/recording-audio-provider";
import { AudioPlayerBar } from "@/components/app/recording/audio-player-bar";
import {
  RecordingTabs,
  TabPlaceholder,
} from "@/components/app/recording/recording-tabs";

export default async function RecordingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getDbUser();
  if (!user) notFound();

  const recording = await getRecordingForUser(user.id, id);
  if (!recording) notFound();
  const tags = await getRecordingTags(id);
  const summary = await getPrimarySummary(id);
  const transcript = await getTranscript(id);
  const templates = await listTemplatesForUser(user.id);
  const items = await getActionItemsForRecording(id);
  const mindMap = await getMindMap(id);

  return (
    <main className="flex-1 p-6 md:p-8">
      <RecordingAudioProvider
        src={recording.audioKey ? `/api/recordings/${id}/audio` : null}
        fallbackDurationSec={recording.durationSec}
      >
        <RecordingHeader
          recording={{
            id: recording.id,
            title: recording.title,
            status: recording.status,
            durationSec: recording.durationSec,
            recordedAt: recording.recordedAt?.toISOString() ?? null,
          }}
          tags={tags.map((t) => ({ id: t.id, name: t.name, color: t.color }))}
        />
        <div className="mt-6">
          <AudioPlayerBar />
        </div>
        <div className="mt-8">
          {recording.status === "failed" ? (
            <FailedPanel recordingId={id} error={recording.error} />
          ) : recording.status !== "done" ? (
            <ProcessingPanel recordingId={id} status={recording.status} />
          ) : (
            <RecordingTabs
              summary={
                <SummaryTab
                  recordingId={id}
                  title={recording.title}
                  summary={
                    summary
                      ? {
                          id: summary.id,
                          contentMd: summary.contentMd,
                          style: summary.style,
                          templateId: summary.templateId,
                        }
                      : null
                  }
                  templates={templates.map((t) => ({
                    id: t.id,
                    name: t.name,
                  }))}
                />
              }
              transcript={<TranscriptTab rows={transcript} />}
              actions={
                <ActionItemsTab
                  items={items.map((it) => ({
                    id: it.id,
                    text: it.text,
                    status: it.status,
                    owner: it.owner,
                    dueAt: it.dueAt?.toISOString() ?? null,
                  }))}
                />
              }
              mindMap={
                mindMap && mindMap.nodes.length > 0 ? (
                  <div className="py-4">
                    <MindMapCanvas graph={mindMap} />
                  </div>
                ) : (
                  <TabPlaceholder>
                    The mind map appears once processing finishes.
                  </TabPlaceholder>
                )
              }
            />
          )}
        </div>
      </RecordingAudioProvider>
    </main>
  );
}
