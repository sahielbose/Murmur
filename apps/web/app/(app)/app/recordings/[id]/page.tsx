import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/current-user";
import {
  getPrimarySummary,
  getRecordingForUser,
  getRecordingTags,
  getTranscript,
} from "@/lib/recordings";
import { listTemplatesForUser } from "@/lib/templates";
import { SummaryTab } from "@/components/app/recording/summary-tab";
import { TranscriptTab } from "@/components/app/recording/transcript-tab";
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
                <TabPlaceholder>Action items appear here.</TabPlaceholder>
              }
              mindMap={<TabPlaceholder>Mind map appears here.</TabPlaceholder>}
            />
          )}
        </div>
      </RecordingAudioProvider>
    </main>
  );
}
