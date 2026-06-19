"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/format";

export type TrashItem = {
  id: string;
  title: string;
  durationSec: number | null;
  deletedAt: string | null;
};

export function TrashView({ items }: { items: TrashItem[] }) {
  const router = useRouter();
  const [list, setList] = useState(items);

  const restore = async (id: string) => {
    setList((l) => l.filter((x) => x.id !== id));
    await fetch(`/api/recordings/${id}/restore`, { method: "POST" }).catch(
      () => {},
    );
    router.refresh();
  };

  const purge = async (item: TrashItem) => {
    if (
      !window.confirm(
        `Permanently delete "${item.title}"? This can't be undone.`,
      )
    )
      return;
    setList((l) => l.filter((x) => x.id !== item.id));
    await fetch(`/api/recordings/${item.id}/purge`, { method: "DELETE" }).catch(
      () => {},
    );
    router.refresh();
  };

  if (list.length === 0) {
    return <p className="text-sm text-fg-muted">The recycle bin is empty.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {list.map((item) => (
        <li key={item.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{item.title}</p>
            <p className="text-xs text-fg-subtle">
              {item.deletedAt ? `Deleted ${formatDate(item.deletedAt)}` : ""}
              {" · "}
              {formatDuration(item.durationSec)}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void restore(item.id)}
            >
              <RotateCcw className="h-4 w-4" />
              Restore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void purge(item)}
              className="text-danger hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
              Delete forever
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
