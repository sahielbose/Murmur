"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ActionItemData } from "./action-item-row";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Local calendar hub (MURMUR_UI.md §10.7). Google Calendar push is Phase 20. */
export function CalendarHub({ tasks }: { tasks: ActionItemData[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const dueByDay = useMemo(() => {
    const map = new Map<string, ActionItemData[]>();
    for (const t of tasks) {
      if (!t.dueAt) continue;
      const key = ymd(new Date(t.dueAt));
      const existing = map.get(key);
      if (existing) existing.push(t);
      else map.set(key, [t]);
    }
    return map;
  }, [tasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startPad = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-fg">
          {cursor.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-bg p-2 text-center text-xs font-medium text-fg-subtle"
          >
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          const items = d ? (dueByDay.get(ymd(d)) ?? []) : [];
          const isToday = d && ymd(d) === ymd(today);
          return (
            <div
              key={i}
              className={cn("min-h-[5rem] bg-bg p-1.5", !d && "bg-bg-subtle")}
            >
              {d ? (
                <>
                  <span
                    className={cn(
                      "text-xs",
                      isToday ? "font-semibold text-fg" : "text-fg-muted",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((it) => (
                      <div
                        key={it.id}
                        className="truncate rounded bg-bg-subtle px-1 py-0.5 text-[11px] text-fg"
                        title={it.text}
                      >
                        {it.text}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-fg-subtle">
        Action items with a due date appear here. Pushing to Google Calendar is
        approval-gated and arrives in Phase 20.
      </p>
    </div>
  );
}
