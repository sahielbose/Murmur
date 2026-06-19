"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileSettings({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const dirty = name.trim() !== initialName && name.trim().length > 0;

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      toast.success("Profile updated.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-fg">
          Name
        </label>
        <div className="flex max-w-sm gap-2">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={() => void save()} disabled={!dirty || saving}>
            Save
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-fg">Email</p>
        <p className="text-sm text-fg-muted">{email}</p>
      </div>
    </div>
  );
}

export function ConsentSettings({
  acknowledgedAt,
}: {
  acknowledgedAt: string | null;
}) {
  const [on, setOn] = useState(!!acknowledgedAt);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consentAcknowledged: next }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      className="flex w-full items-start gap-3 text-left"
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          on
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border-strong"
        }`}
      >
        {on ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <span className="text-sm text-fg-muted">
        I understand that I&apos;m responsible for obtaining consent from
        everyone in a conversation before recording it, in line with the laws
        that apply to me.
      </span>
    </button>
  );
}
