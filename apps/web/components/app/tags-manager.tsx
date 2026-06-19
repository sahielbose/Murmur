"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TagItem = {
  id: string;
  name: string;
  color: string;
  recordingCount: number;
};

export function TagsManager({ tags }: { tags: TagItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await fetch("/api/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const rename = async (t: TagItem) => {
    const next = window.prompt("Rename tag", t.name);
    if (!next?.trim()) return;
    const res = await fetch(`/api/tags/${t.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: next.trim() }),
    });
    if (res.status === 409) {
      toast.error("A tag with that name already exists.");
      return;
    }
    if (!res.ok) {
      toast.error("Could not rename the tag.");
      return;
    }
    router.refresh();
  };

  const remove = async (t: TagItem) => {
    if (!window.confirm(`Delete the tag "${t.name}"?`)) return;
    const res = await fetch(`/api/tags/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete the tag.");
      return;
    }
    router.refresh();
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
        className="mb-6 flex max-w-sm gap-2"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name"
          aria-label="New tag name"
        />
        <Button type="submit" disabled={busy || !name.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      {tags.length === 0 ? (
        <p className="text-sm text-fg-muted">No tags yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {tags.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <span className="font-medium text-fg">{t.name}</span>
              <span className="text-sm text-fg-subtle">
                {t.recordingCount}{" "}
                {t.recordingCount === 1 ? "recording" : "recordings"}
              </span>
              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  aria-label="Rename tag"
                  onClick={() => void rename(t)}
                  className="text-fg-subtle hover:text-fg"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete tag"
                  onClick={() => void remove(t)}
                  className="text-fg-subtle hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
