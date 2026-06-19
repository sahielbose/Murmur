"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TagPill, type TagLike } from "@/components/app/tag-pill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TagEditor({
  recordingId,
  initialTags,
  allTags,
}: {
  recordingId: string;
  initialTags: TagLike[];
  allTags: TagLike[];
}) {
  const [current, setCurrent] = useState(initialTags);
  const [available, setAvailable] = useState(allTags);

  const assign = async (input: { tagId?: string; name?: string }) => {
    const res = await fetch(`/api/recordings/${recordingId}/tags`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return;
    const t = (await res.json()) as TagLike;
    setCurrent((c) => (c.some((x) => x.id === t.id) ? c : [...c, t]));
    setAvailable((a) => (a.some((x) => x.id === t.id) ? a : [...a, t]));
  };

  const remove = async (tagId: string) => {
    setCurrent((c) => c.filter((x) => x.id !== tagId));
    await fetch(`/api/recordings/${recordingId}/tags`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tagId }),
    }).catch(() => {});
  };

  const createNew = async () => {
    const name = window.prompt("New tag name");
    if (name?.trim()) await assign({ name: name.trim() });
  };

  const unassigned = available.filter(
    (a) => !current.some((c) => c.id === a.id),
  );

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {current.map((t) => (
        <TagPill key={t.id} tag={t} onRemove={() => void remove(t.id)} />
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-fg-muted hover:border-border-strong hover:text-fg"
          >
            <Plus className="h-3 w-3" />
            Tag
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {unassigned.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onSelect={() => void assign({ tagId: t.id })}
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </DropdownMenuItem>
          ))}
          {unassigned.length > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem onSelect={() => void createNew()}>
            <Plus className="h-4 w-4" />
            New tag…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
