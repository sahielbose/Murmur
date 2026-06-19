"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteRecordingButton({
  recordingId,
}: {
  recordingId: string;
}) {
  const router = useRouter();

  const del = async () => {
    if (!window.confirm("Move this recording to the trash?")) return;
    const res = await fetch(`/api/recordings/${recordingId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Moved to trash.");
      router.push("/app/library");
    } else {
      toast.error("Could not delete the recording.");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={del}
      className="text-danger hover:text-danger"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
