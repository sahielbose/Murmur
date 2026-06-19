"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";

/** Processing view — polls status and refreshes when the pipeline finishes. */
export function ProcessingPanel({
  recordingId,
  status,
}: {
  recordingId: string;
  status: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/recordings/${recordingId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { status?: string };
        if (data.status === "done" || data.status === "failed") {
          clearInterval(id);
          router.refresh();
        }
      } catch {
        // keep polling
      }
    }, 1500);
    return () => clearInterval(id);
  }, [recordingId, router]);

  return (
    <div className="py-6">
      <div className="flex items-center gap-2">
        <StatusPill status={status} />
        <span className="text-sm text-fg-muted">
          Murmur is processing this recording…
        </span>
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/** Failed view — shows the reason and a retry button. */
export function FailedPanel({
  recordingId,
  error,
}: {
  recordingId: string;
  error: string | null;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/recordings/${recordingId}/retry`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Could not retry processing.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="py-6">
      <StatusPill status="failed" />
      <p className="mt-3 text-sm text-fg-muted">
        {error || "Processing failed. You can try again."}
      </p>
      <Button className="mt-4" size="sm" onClick={retry} disabled={retrying}>
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </div>
  );
}
