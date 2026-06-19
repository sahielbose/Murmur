import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/current-user";
import {
  getPrimarySummary,
  getMindMap,
  getRecordingForUser,
  getRecordingTags,
  getTranscript,
  listRecordingsForUser,
} from "@/lib/recordings";
import { CombineButton } from "@/components/app/recording/combine-button";
import { DeleteRecordingButton } from "@/components/app/recording/delete-recording-button";
import { listTemplatesForUser } from "@/lib/templates";
import { listTagsForUser } from "@/lib/tags";
import { getActionItemsForRecording } from "@/lib/action-items";
import { MindMapTab } from "@/components/app/recording/mind-map-tab";
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
import { RecordingTabs } from "@/components/app/recording/recording-tabs";

export default async function RecordingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  const seekMs = t && Number.isFinite(Number(t)) ? Number(t) * 1000 : null;
  const user = await getDbUser();
  if (!user) notFound();

  const recording = await getRecordingForUser(user.id, id);
  if (!recording) notFound();
  const tags = await getRecordingTags(id);
  const allTags = await listTagsForUser(user.id);
  const others = (await listRecordingsForUser(user.id)).filter(
    (r) => r.id !== id && r.status === "done",
  );
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
        initialSeekMs={seekMs}
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
          allTags={allTags.map((t) => ({
            id: t.id,
            name: t.name,
            color: t.color,
          }))}
        />
        <div className="mt-4 flex items-center gap-2">
          <CombineButton
            recordingId={id}
            recordingTitle={recording.title}
            others={others.map((r) => ({ id: r.id, title: r.title }))}
          />
          <DeleteRecordingButton recordingId={id} />
        </div>
        <div className="mt-4">
          <AudioPlayerBar />
        </div>
        <div className="mt-8">
          {recording.status === "failed" ? (
            <FailedPanel recordingId={id} error={recording.error} />
          ) : recording.status !== "done" ? (
            <ProcessingPanel recordingId={id} status={recording.status} />
          ) : (
            <RecordingTabs
              defaultTab={seekMs != null ? "transcript" : "summary"}
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
                <MindMapTab
                  recordingId={id}
                  title={recording.title}
                  graph={mindMap}
                />
              }
            />
          )}
        </div>
      </RecordingAudioProvider>
    </main>
  );
}
