"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Export every recording as a single .zip of Markdown files. */
export function BulkExportButton() {
  const [busy, setBusy] = useState(false);

  const exportAll = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/export/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ format: "md" }),
      });
      if (!res.ok) {
        toast.error("Export failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "murmur-export.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={exportAll} disabled={busy}>
      <Download className="h-4 w-4" />
      {busy ? "Exporting…" : "Export all"}
    </Button>
  );
}
