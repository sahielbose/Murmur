"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = {
  configured: boolean;
  source: "env" | "settings" | null;
  hint: string | null;
  editable: boolean;
};

export function ApiKeySettings({
  provider,
  placeholder,
  help,
  connectedLabel,
  successMessage,
}: {
  provider: "anthropic" | "elevenlabs" | "openai";
  placeholder: string;
  help: string;
  connectedLabel: string;
  successMessage: string;
}) {
  const endpoint = `/api/settings/keys/${provider}`;
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(endpoint);
    if (res.ok) setStatus((await res.json()) as Status);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const save = async () => {
    if (!key.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() }),
      });
      const data = (await res.json()) as Status & { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not connect the key.");
        return;
      }
      setKey("");
      setStatus(data);
      // Re-render the server component so the Providers panel flips to "live".
      router.refresh();
      toast.success(successMessage);
    } catch {
      toast.error("Could not validate the key. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setStatus((await res.json()) as Status);
        router.refresh();
        toast.success("Key removed.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (!status) {
    return <p className="text-sm text-fg-muted">Loading…</p>;
  }

  if (status.configured) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden className="h-2 w-2 rounded-full bg-fg" />
          <span className="font-medium text-fg">{connectedLabel}</span>
          {status.hint ? (
            <span className="font-mono text-xs text-fg-muted">
              {status.hint}
            </span>
          ) : null}
          {status.source === "env" ? (
            <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-xs text-fg-muted">
              via environment
            </span>
          ) : null}
        </div>
        {status.editable ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={() => void remove()}
            disabled={busy}
          >
            Remove
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex max-w-md gap-2">
        <Input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
          }}
          placeholder={placeholder}
          aria-label={`${provider} API key`}
          autoComplete="off"
        />
        <Button onClick={() => void save()} disabled={busy || !key.trim()}>
          {busy ? "Connecting…" : "Connect"}
        </Button>
      </div>
      <p className="text-xs text-fg-muted">{help}</p>
    </div>
  );
}
