import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser, getRecordingTags } from "@/lib/recordings";
import { RecordingHeader } from "@/components/app/recording/recording-header";
import { RecordingAudioProvider } from "@/components/app/recording/recording-audio-provider";
import { AudioPlayerBar } from "@/components/app/recording/audio-player-bar";

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
      </RecordingAudioProvider>
    </main>
  );
}
