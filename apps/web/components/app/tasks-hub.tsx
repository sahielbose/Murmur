"use client";

import { useState } from "react";
import { ListChecks, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionItemData } from "./action-item-row";
import { TasksView } from "./tasks-view";
import { CalendarHub } from "./calendar-hub";

/** Tasks hub: switch between the aggregated list and the calendar hub. */
export function TasksHub({ tasks }: { tasks: ActionItemData[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-1 rounded-lg border border-border p-1">
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors",
            view === "list"
              ? "bg-bg-subtle font-medium text-fg"
              : "text-fg-muted hover:text-fg",
          )}
        >
          <ListChecks className="h-4 w-4" />
          List
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors",
            view === "calendar"
              ? "bg-bg-subtle font-medium text-fg"
              : "text-fg-muted hover:text-fg",
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Calendar
        </button>
      </div>

      {view === "list" ? (
        <TasksView tasks={tasks} />
      ) : (
        <CalendarHub tasks={tasks} />
      )}
    </div>
  );
}
