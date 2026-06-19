import Link from "next/link";
import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/current-user";
import { getCombineGroup } from "@/lib/combine";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { Markdown } from "@/components/markdown";

export default async function CombinedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getDbUser();
  if (!user) notFound();
  const view = await getCombineGroup(user.id, id);
  if (!view) notFound();

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title={view.group.title}
        description={`${view.members.length} recordings combined - each section links back to its source.`}
      />
      <div className="mt-6 space-y-5">
        {view.members.map((m) => (
          <section
            key={m.recordingId}
            className="rounded-lg border border-border p-5"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="font-medium text-fg-strong">{m.title}</h2>
              <Link
                href={`/app/recordings/${m.recordingId}`}
                className="shrink-0 text-xs text-fg-subtle hover:text-fg"
              >
                Open recording →
              </Link>
            </div>
            {m.recordedAt ? (
              <p className="text-xs text-fg-subtle">
                {formatDate(m.recordedAt)}
              </p>
            ) : null}
            {m.summaryMd ? (
              <div className="mt-3 text-sm">
                <Markdown>{m.summaryMd}</Markdown>
              </div>
            ) : (
              <p className="mt-3 text-sm text-fg-muted">No summary yet.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
