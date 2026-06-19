"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];

export function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, company, teamSize, message }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-bg-subtle p-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg">
          <Check className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-serif text-2xl tracking-tight text-fg-strong">
          Thanks — we&apos;ll be in touch.
        </h2>
        <p className="mt-2 text-fg-muted">
          A member of our team will reach out to {email} shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-border p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-fg">Name</span>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-fg">Work email</span>
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-fg">Company</span>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-fg">Team size</span>
          <Select value={teamSize} onValueChange={setTeamSize}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-fg">What are you hoping to do?</span>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a little about your team and how you'd use Murmur."
          className="min-h-28"
        />
      </label>
      {status === "error" ? (
        <p className="text-sm text-danger">
          Something went wrong. Please check your details and try again.
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Talk to sales"}
      </Button>
    </form>
  );
}
