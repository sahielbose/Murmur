"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type TemplateItem = {
  id: string;
  name: string;
  description: string | null;
  promptBody: string;
  isSystem: boolean;
};

export function TemplatesManager({ templates }: { templates: TemplateItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [promptBody, setPromptBody] = useState("");
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPromptBody("");
    setOpen(true);
  };

  const openEdit = (t: TemplateItem) => {
    setEditing(t);
    setName(t.name);
    setDescription(t.description ?? "");
    setPromptBody(t.promptBody);
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim() || !promptBody.trim()) {
      toast.error("Name and instructions are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/templates/${editing.id}` : "/api/templates";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description, promptBody }),
      });
      if (!res.ok) throw new Error();
      setOpen(false);
      toast.success(editing ? "Template updated." : "Template created.");
      router.refresh();
    } catch {
      toast.error("Could not save the template.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: TemplateItem) => {
    const res = await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Template deleted.");
      router.refresh();
    } else {
      toast.error("Could not delete the template.");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New template
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-2 rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-fg">{t.name}</h3>
              {t.isSystem ? (
                <Badge variant="outline">System</Badge>
              ) : (
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit template"
                    onClick={() => openEdit(t)}
                    className="text-fg-subtle hover:text-fg"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete template"
                    onClick={() => remove(t)}
                    className="text-fg-subtle hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {t.description ? (
              <p className="text-sm text-fg-muted">{t.description}</p>
            ) : null}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit template" : "New template"}
            </DialogTitle>
            <DialogDescription>
              Give it a name and the instructions Murmur should follow when
              summarizing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Template name"
            />
            <Input
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Description"
            />
            <textarea
              placeholder="Instructions, e.g. 'Summarize as a punchy recap with three takeaways.'"
              value={promptBody}
              onChange={(e) => setPromptBody(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border bg-bg p-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Instructions"
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
