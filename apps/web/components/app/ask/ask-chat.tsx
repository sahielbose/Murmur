"use client";

import { useRef, useState } from "react";
import { Sparkles, ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AskMessage, type AskMessageData } from "./ask-message";

export type ThreadSummary = { id: string; title: string };
export type RecordingOption = { id: string; title: string };

export function AskChat({
  initialThreads,
  recordings,
}: {
  initialThreads: ThreadSummary[];
  recordings: RecordingOption[];
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AskMessageData[]>([]);
  const [input, setInput] = useState("");
  const [scopeId, setScopeId] = useState("all");
  const [sending, setSending] = useState(false);
  // Guards selectThread against out-of-order responses on rapid switching.
  const latestThreadRef = useRef<string | null>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q, citations: [] }]);
    setSending(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          threadId: activeId,
          question: q,
          scope: scopeId === "all" ? "library" : "recording",
          scopeRecordingId: scopeId === "all" ? null : scopeId,
        }),
      });
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "Something went wrong answering that. Please try again.",
            citations: [],
          },
        ]);
        return;
      }
      const data = (await res.json()) as {
        threadId?: string;
        threadTitle?: string;
        message?: { content: string; citations: AskMessageData["citations"] };
      };
      if (data.threadId && data.threadId !== activeId) {
        setActiveId(data.threadId);
        setThreads((t) =>
          t.some((x) => x.id === data.threadId)
            ? t
            : [
                { id: data.threadId!, title: data.threadTitle ?? "New chat" },
                ...t,
              ],
        );
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.message?.content ?? "…",
          citations: data.message?.citations ?? [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          citations: [],
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const selectThread = async (id: string) => {
    setActiveId(id);
    setMessages([]);
    latestThreadRef.current = id;
    try {
      const res = await fetch(`/api/ask/threads/${id}`);
      // Ignore a response that arrived after the user switched threads again.
      if (latestThreadRef.current !== id) return;
      if (res.ok) {
        const data = (await res.json()) as { messages: AskMessageData[] };
        if (latestThreadRef.current === id) setMessages(data.messages);
      }
    } catch {
      /* keep the (now-empty) pane; user can reselect */
    }
  };

  const newChat = () => {
    latestThreadRef.current = null;
    setActiveId(null);
    setScopeId("all");
    setMessages([]);
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border p-3 md:flex">
        <Button size="sm" className="w-full justify-start" onClick={newChat}>
          <Plus className="h-4 w-4" />
          New chat
        </Button>
        <div className="mt-3 flex flex-col gap-0.5 overflow-y-auto">
          {threads.length === 0 ? (
            <p className="px-2 py-4 text-xs text-fg-subtle">
              No conversations yet.
            </p>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectThread(t.id)}
                className={cn(
                  "truncate rounded-md px-2 py-1.5 text-left text-sm",
                  activeId === t.id
                    ? "bg-bg-subtle text-fg"
                    : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                )}
              >
                {t.title}
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-fg">
                <Sparkles className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-medium text-fg">
                Ask your conversations anything
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                Answers link straight to the moment it was said.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {messages.map((m, i) => (
                <AskMessage key={i} message={m} />
              ))}
              {sending ? (
                <p className="text-sm text-fg-subtle">Murmur is thinking…</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mx-auto mb-2 flex max-w-2xl items-center gap-2">
            <span className="text-xs text-fg-subtle">Searching</span>
            <Select value={scopeId} onValueChange={setScopeId}>
              <SelectTrigger className="h-8 w-56 text-xs">
                <SelectValue placeholder="All recordings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All recordings</SelectItem>
                {recordings.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="mx-auto flex max-w-2xl items-end gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your recordings"
              aria-label="Ask a question"
              className="h-11 flex-1 rounded-md border border-border bg-bg px-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !input.trim()}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
