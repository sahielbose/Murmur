"use client";

import { useState } from "react";
import {
  ActionItemRow,
  type ActionItemData,
} from "@/components/app/action-item-row";

export function ActionItemsTab({
  items,
  recordingTitle,
}: {
  items: ActionItemData[];
  recordingTitle?: string;
}) {
  const [list, setList] = useState(items);

  const toggle = async (id: string, done: boolean) => {
    setList((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: done ? "done" : "open" } : it,
      ),
    );
    await fetch(`/api/action-items/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: done ? "done" : "open" }),
    }).catch(() => {});
  };

  if (list.length === 0) {
    return (
      <p className="py-6 text-sm text-fg-muted">
        No action items were found in this conversation.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border py-2">
      {list.map((item) => (
        <ActionItemRow
          key={item.id}
          item={item}
          onToggle={toggle}
          recordingTitle={recordingTitle}
        />
      ))}
    </ul>
  );
}
