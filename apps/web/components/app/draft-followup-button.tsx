"use client";

import { useState } from "react";
import { Copy, PenLine } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Kind = "email" | "message";

export function DraftFollowupButton({
  commitment,
  recordingTitle,
  label = "Draft follow-up",
  className,
}: {
  commitment: string;
  recordingTitle?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("email");
  const [subject, setSubject] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (k: Kind) => {
    setLoading(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commitment, recordingTitle, kind: k }),
      });
      if (!res.ok) {
        toast.error("Could not draft a follow-up.");
        return;
      }
      const data = (await res.json()) as {
        subject?: string | null;
        body?: string;
      };
      setSubject(data.subject ?? null);
      setBody(data.body ?? "");
    } catch {
      toast.error("Could not draft a follow-up.");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = () => {
    setOpen(true);
    setKind("email");
    setSubject(null);
    setBody("");
    void generate("email");
  };

  const selectKind = (k: Kind) => {
    if (k === kind) return;
    setKind(k);
    void generate(k);
  };

  const copy = async () => {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    await navigator.clipboard.writeText(text);
    toast.success("Draft copied - send it whenever you're ready.");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={openDialog}
        className={className}
      >
        <PenLine className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draft a follow-up</DialogTitle>
            <DialogDescription>
              Review and edit it, then send it yourself. Murmur never sends
              anything on your behalf.
            </DialogDescription>
          </DialogHeader>

          <div className="inline-flex rounded-md border border-border p-0.5 text-sm">
            {(["email", "message"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => selectKind(k)}
                className={cn(
                  "rounded px-3 py-1 capitalize",
                  kind === k ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
                )}
              >
                {k}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-fg-muted">Drafting…</p>
          ) : (
            <div className="space-y-3">
              {subject !== null ? (
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-label="Subject"
                />
              ) : null}
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                aria-label="Draft body"
                className="min-h-44"
              />
            </div>
          )}

          <DialogFooter>
            <span className="mr-auto self-center text-xs text-fg-subtle">
              Nothing is sent automatically.
            </span>
            <Button variant="secondary" onClick={() => void copy()}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
