"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ActionItemRow,
  type ActionItemData,
} from "@/components/app/action-item-row";

type Filter = "open" | "done" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "done", label: "Done" },
  { key: "all", label: "All" },
];

export function TasksView({ tasks }: { tasks: ActionItemData[] }) {
  const [filter, setFilter] = useState<Filter>("open");
  const [list, setList] = useState(tasks);

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

  const filtered = list.filter((t) =>
    filter === "all" ? true : t.status === filter,
  );

  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-1 rounded-lg border border-border p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors",
              filter === f.key
                ? "bg-bg-subtle font-medium text-fg"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-sm text-fg-muted">
          {filter === "open"
            ? "No open action items. Nice."
            : "Nothing here yet."}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((item) => (
            <ActionItemRow key={item.id} item={item} onToggle={toggle} />
          ))}
        </ul>
      )}
    </div>
  );
}
